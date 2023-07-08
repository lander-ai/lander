using Windows.Management.Deployment;
using Newtonsoft.Json;
using System.Text;
using CommandLine;
using System.Diagnostics;
using System.Runtime.InteropServices;
using UIAutomationClient;
using ShellLink;
using System.Text.RegularExpressions;
using Windows.ApplicationModel.Core;

namespace Applications {
    internal class Application {
        public string id { get; set; }
        public string name { get; set; }
        public string path { get; set; }
        public bool uwp { get; set; }
    }

    internal class FocusedApplication : Application {
        public string? selected_text { get; set; }
    }

    internal class Program {
        static void Main(string[] args) {
            Console.InputEncoding = Encoding.UTF8;
            Console.OutputEncoding = Encoding.UTF8;

            Parser.Default.ParseArguments<
                ListApplicationsOptions,
                OpenApplicationOptions,
                ExtractApplicationIconOptions,
                FocusedApplicationOptions
            >(args)
                .WithParsed<ListApplicationsOptions>(o => {
                    var applications = ListApplications();
                    Console.WriteLine(JsonConvert.SerializeObject(applications));
                })
                .WithParsed<OpenApplicationOptions>(o => {
                    OpenApplication(o.Target);
                })
                .WithParsed<ExtractApplicationIconOptions>(o => {
                    ExtractIcon(o.Input, o.Output);
                })
                .WithParsed<FocusedApplicationOptions>(o => {
                    var focusedApplication = GetFocusedApplication();
                    Console.WriteLine(JsonConvert.SerializeObject(focusedApplication));
                });
        }

        static List<Application> ListApplications() {
            List<Application> applications = new List<Application>();

            PackageManager packageManager = new PackageManager();
            var packages = packageManager.FindPackagesForUser(string.Empty);

            var uwpApplications = packages
                .SelectMany(package => package.GetAppListEntriesAsync().GetAwaiter().GetResult(), (package, entry) => new { package, entry })
                .Select(data => new Application {
                    id = data.entry.AppUserModelId,
                    name = data.entry.DisplayInfo.DisplayName,
                    path = data.package.InstalledPath,
                    uwp = true
                })
                .ToList();

            applications.AddRange(uwpApplications);

            var startMenuFolders = new List<string> {
                Environment.GetFolderPath(Environment.SpecialFolder.CommonStartMenu),
                Environment.GetFolderPath(Environment.SpecialFolder.StartMenu)
            };

            var startMenuApplications = startMenuFolders
                .Select((startMenuFolderPath) => new DirectoryInfo(startMenuFolderPath))
                .SelectMany((startMenuFolder) => startMenuFolder.GetFiles("*.lnk", SearchOption.AllDirectories))
                .Select((shortcut) => new Application {
                    id = shortcut.FullName,
                    name = shortcut.Name.Replace(".lnk", ""),
                    path = shortcut.FullName,
                    uwp = false
                });

            applications.AddRange(startMenuApplications);

            return applications.OrderBy(application => application.name).ToList();
        }

        static async void OpenApplication(string target) {
            if (target.EndsWith(".lnk")) {
                Process.Start(new ProcessStartInfo(target) { UseShellExecute = true });
            } else {
                PackageManager packageManager = new PackageManager();
                var packages = packageManager.FindPackagesForUser(string.Empty);

                var entry = packages
                    .SelectMany((package) => package.GetAppListEntries(), (package, entry) => entry)
                    .FirstOrDefault(entry => entry.AppUserModelId == target);

                if (entry == null) {
                    throw new Exception("Specified target does not exist.");
                }

                await entry.LaunchAsync();
            }
        }

        static void ExtractIcon(string input, string outputPath) {
            if (!File.Exists(input)) {
                IconExtractor.ExtractUWPIcon(input, outputPath);
            } else {
                IconExtractor.ExtractLNKIcon(input, outputPath);
            }
        }

        static FocusedApplication? GetFocusedApplication() {
            FocusedApplication? focusedApplication = null;

            var foregroundWindow = GetForegroundWindow();

            if (foregroundWindow.Equals(IntPtr.Zero)) {
                return null;
            };

            IUIAutomation automation = new CUIAutomation8();

            int pid;
            GetWindowThreadProcessId(foregroundWindow.ToInt32(), out pid);

            var process = Process.GetProcessById(pid);

            if (process.MainModule == null) {
                return null;
            }

            var path = process.MainModule.FileName.ToString();

            var windowElement = automation.ElementFromHandle(foregroundWindow);
            var displayName = windowElement.CurrentName;

            if (displayName == "" || displayName == "Taskbar") {
                return null;
            }

            if (
                path.Contains("WindowsApps") ||
                path.Contains("SystemApps") ||
                path.Contains("ApplicationFrameHost")
            ) {
                PackageManager packageManager = new PackageManager();
                var packages = packageManager.FindPackagesForUser(string.Empty);

                Regex regex = new Regex(@"(SystemApps|WindowsApps)\\(.*?)\\");
                Match match = regex.Match(path);

                AppListEntry? entry = null;

                if (match.Success) {
                    var appUserModelId = match.Groups[2].Value;

                    var package = packages.FirstOrDefault(package => package.Id.FullName == appUserModelId);

                    if (package == null) {
                        return null;
                    }

                    var entries = package.GetAppListEntries();

                    entry = entries.FirstOrDefault();
                } else {

                    var entries = packages
                        .SelectMany((package) => package.GetAppListEntries(), (package, entry) => entry);

                    entry = entries
                        .FirstOrDefault(entry => entry.DisplayInfo.DisplayName == displayName);
                }

                if (entry == null) {
                    return null;
                }

                focusedApplication = new FocusedApplication {
                    id = entry.AppUserModelId,
                    name = entry.DisplayInfo.DisplayName,
                    path = entry.AppInfo.PackageFamilyName,
                    uwp = true
                };
            } else {
                var startMenuFolders = new List<string> {
                    Environment.GetFolderPath(Environment.SpecialFolder.CommonStartMenu),
                    Environment.GetFolderPath(Environment.SpecialFolder.StartMenu)
                };

                var shortcut = startMenuFolders
                    .Select((startMenuFolderPath) => new DirectoryInfo(startMenuFolderPath))
                    .SelectMany((startMenuFolder) => startMenuFolder.GetFiles("*.lnk", SearchOption.AllDirectories))
                    .Select((shortcutPath) => {
                        var shortcut = Shortcut.ReadFromFile(shortcutPath.FullName);

                        string? shortcutTargetPath = null;

                        if (shortcut.LinkInfo?.LocalBasePath != null) {
                            shortcutTargetPath = shortcut.LinkInfo.LocalBasePath;
                        } else if (shortcut.LinkTargetIDList?.Path != null) {
                            shortcutTargetPath = shortcut.LinkTargetIDList.Path;
                        } else if (shortcut.StringData?.IconLocation != null) {
                            shortcutTargetPath = shortcut.StringData.IconLocation;
                        }

                        string? executablePath = null;

                        if (shortcutTargetPath != null) {
                            var resolvedShortcutTargetPath = Environment.ExpandEnvironmentVariables(shortcutTargetPath);

                            if (File.Exists(resolvedShortcutTargetPath)) {
                                executablePath = resolvedShortcutTargetPath;
                            }
                        }

                        return new { executablePath, shortcutPath };
                    })
                    .GroupBy(data => data.executablePath)
                    .Where(data => data != null && data.Count() == 1)
                    .SelectMany(data => data)
                    .FirstOrDefault((data) => data.executablePath == path)?
                    .shortcutPath;

                if (shortcut == null) {
                    return null;
                }

                focusedApplication = new FocusedApplication {
                    id = shortcut.FullName ?? "",
                    name = displayName,
                    path = shortcut.FullName ?? "",
                    uwp = false
                };
            }

            if (focusedApplication == null) {
                return null;
            }

            var focusedElement = automation.GetFocusedElement();

            if (focusedElement == null) {
                return focusedApplication;
            }

            var textPattern = (IUIAutomationTextPattern)focusedElement.GetCurrentPattern(UIA_PatternIds.UIA_TextPatternId);

            if (textPattern == null) {
                return focusedApplication;
            }

            IUIAutomationTextRangeArray selection = textPattern.GetSelection();

            string selectedText = "";

            if (selection != null) {
                for (int i = 0; i < selection.Length; i++) {
                    IUIAutomationTextRange element = selection.GetElement(i);
                    selectedText += element.GetText(-1);
                }
            }

            focusedApplication.selected_text = selectedText;

            return focusedApplication;
        }

        [DllImport("user32.dll", CharSet = CharSet.Auto, ExactSpelling = true)]
        internal static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        internal static extern int GetWindowThreadProcessId(int handle, out int processId);
    }
}

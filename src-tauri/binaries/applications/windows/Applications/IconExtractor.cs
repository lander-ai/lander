using ShellLink;
using System.Drawing.Icons;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Drawing.Imaging;
using Windows.Management.Deployment;

namespace Applications {
    internal class IconExtractor {
        public static async void ExtractUWPIcon(string target, string outputPath) {
            if (!File.Exists(target)) {
                PackageManager packageManager = new PackageManager();
                var packages = packageManager.FindPackagesForUser(string.Empty);

                var entry = packages
                    .SelectMany((package) => package.GetAppListEntries(), (package, entry) => entry)
                    .FirstOrDefault(entry => entry.AppUserModelId == target);

                if (entry == null) {
                    throw new Exception("Specified input package does not exist.");
                }

                using (var stream = await entry.DisplayInfo.GetLogo(new Windows.Foundation.Size(1, 1)).OpenReadAsync()) {
                    var bitmap = new Bitmap(stream.AsStreamForRead());

                    Point min = new Point(int.MaxValue, int.MaxValue);
                    Point max = new Point(int.MinValue, int.MinValue);

                    for (int x = 0; x < bitmap.Width; ++x) {
                        for (int y = 0; y < bitmap.Height; ++y) {
                            Color pixelColor = bitmap.GetPixel(x, y);
                            if (pixelColor.A > 0) {
                                if (x < min.X) min.X = x;
                                if (y < min.Y) min.Y = y;

                                if (x > max.X) max.X = x;
                                if (y > max.Y) max.Y = y;
                            }
                        }
                    }

                    Rectangle cropRectangle = new Rectangle(min.X, min.Y, max.X - min.X, max.Y - min.Y);
                    Bitmap croppedBitmap = new Bitmap(cropRectangle.Width, cropRectangle.Height);
                    using (Graphics g = Graphics.FromImage(croppedBitmap)) {
                        g.DrawImage(bitmap, 0, 0, cropRectangle, GraphicsUnit.Pixel);
                        croppedBitmap.Save(outputPath, ImageFormat.Png);
                    }
                }
            }
        }

        public static void ExtractLNKIcon(string inputPath, string outputPath) {
            int dllIconIndex = 0;

            var iconPath = inputPath;

            if (inputPath.EndsWith(".lnk")) {
                var shortcut = Shortcut.ReadFromFile(inputPath);

                string? shortcutTargetPath = null;

                if (shortcut.StringData?.IconLocation != null) {
                    shortcutTargetPath = shortcut.StringData.IconLocation;
                } else if (shortcut.LinkTargetIDList?.Path != null) {
                    shortcutTargetPath = shortcut.LinkTargetIDList.Path;
                } else if (shortcut.LinkInfo?.LocalBasePath != null) {
                    shortcutTargetPath = shortcut.LinkInfo.LocalBasePath;
                }

                if (shortcutTargetPath != null) {
                    var resolvedShortcutTargetPath = Environment.ExpandEnvironmentVariables(shortcutTargetPath);

                    if (File.Exists(resolvedShortcutTargetPath)) {
                        iconPath = resolvedShortcutTargetPath;
                    }
                }

                dllIconIndex = shortcut.IconIndex;
            }

            Icon? icon;

            if (
                iconPath.EndsWith("imageres.dll") ||
                iconPath.EndsWith("shell32.dll") ||
                iconPath.EndsWith("ddores.dll")
            ) {
                icon = DLLIconExtractor.Extract(iconPath, dllIconIndex);
            } else {
                icon = IconsExtractor.ExtractIconFromFile(iconPath);
            }

            if (icon != null) {
                var converter = new ImageConverter();
                var imageData = converter.ConvertTo(icon.ToBitmap(), typeof(byte[])) as byte[];

                if (imageData != null) {
                    File.WriteAllBytes(outputPath, imageData);
                }
            }
        }

        private class DLLIconExtractor {
            public static Icon? Extract(string file, int number) {
                IntPtr icon;
                IntPtr _smallIcon;

                ExtractIconEx(file, number, out icon, out _smallIcon, 1);

                try {
                    return Icon.FromHandle(icon);
                } catch {
                    return null;
                }

            }
            [DllImport("Shell32.dll", EntryPoint = "ExtractIconExW", CharSet = CharSet.Unicode, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
            private static extern int ExtractIconEx(string sFile, int iIndex, out IntPtr piLargeVersion, out IntPtr piSmallVersion, int amountIcons);
        }
    }
}


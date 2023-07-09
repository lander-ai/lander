using CommandLine;

namespace Applications {
    [Verb("list", HelpText = "List all installed applications.")]
    internal class ListApplicationsOptions {
    }

    [Verb("open", HelpText = "Open an application.")]
    internal class OpenApplicationOptions {
        [Value(0, MetaName = "target", HelpText = "Target to open.", Required = true)]
        public string Target { get; set; }
    }

    [Verb("extract-icon", HelpText = "Extract icon from an application.")]
    internal class ExtractApplicationIconOptions {
        [Value(0, MetaName = "input", HelpText = "Application ID or path to .lnk file.", Required = true)]
        public string Input { get; set; }

        [Value(1, MetaName = "output-path", HelpText = "Location to save icon.", Required = true)]
        public string Output { get; set; }
    }

    [Verb("focused-application", HelpText = "Get focused application.")]
    internal class FocusedApplicationOptions {
    }
}

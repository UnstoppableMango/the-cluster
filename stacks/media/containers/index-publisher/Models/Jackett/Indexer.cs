using System.Collections.Generic;

// ReSharper disable ClassNeverInstantiated.Global
// ReSharper disable InconsistentNaming
// ReSharper disable UnusedMember.Global
// ReSharper disable IdentifierTypo
#pragma warning disable 8618

namespace IndexPublisher.Models.Jackett
{
    public class Capability
    {
        public string ID { get; set; }

        public string Name { get; set; }
    }

    public class Indexer
    {
        public string id { get; set; }

        public string name { get; set; }

        public string description { get; set; }

        public string type { get; set; }

        public bool configured { get; set; }

        public string site_link { get; set; }

        public IEnumerable<string> alternativesitelinks { get; set; }

        public string language { get; set; }

        public string last_error { get; set; }

        public bool potatoenabled { get; set; }

        public IEnumerable<Capability> caps { get; set; }
    }
}

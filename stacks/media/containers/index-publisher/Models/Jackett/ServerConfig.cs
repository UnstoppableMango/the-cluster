// ReSharper disable IdentifierTypo
// ReSharper disable InconsistentNaming

namespace IndexPublisher.Models.Jackett
{
    public class ServerConfig
    {
        public int Port { get; set; }
        public bool AllowExternal { get; set; }
        public string? APIKey { get; set; }
        public string? AdminPassword { get; set; }
        public string? InstanceId { get; set; }
        public string? BlackholeDir { get; set; }
        public bool UpdateDisabled { get; set; }
        public bool UpdatePrerelease { get; set; }
        public string? BasePathOverride { get; set; }
        public bool CacheEnabled { get; set; }
        public long CacheTtl { get; set; }
        public long CacheMaxResultsPerIndexer { get; set; }
        public string? FlareSolverrUrl { get; set; }
        public string? OmdbApiKey { get; set; }
        public string? OmdbApiUrl { get; set; }
    }
}

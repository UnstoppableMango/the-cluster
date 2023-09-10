using System.Reactive.Subjects;
using IndexPublisher.Models.Jackett;

namespace IndexPublisher.Services
{
    public interface IIndexWatcher : ISubject<Indexer>
    {
    }
}

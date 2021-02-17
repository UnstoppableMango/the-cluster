using System;
using System.Reactive.Subjects;
using IndexPublisher.Clients;
using IndexPublisher.Models.Jackett;
using Microsoft.Extensions.Logging;

namespace IndexPublisher.Services
{
    internal class IndexWatcher : IIndexWatcher
    {
        private readonly ILogger<IndexWatcher> _logger;
        private readonly Subject<Indexer> _subject = new();

        public IndexWatcher(IJackettClient jackettClient, ILogger<IndexWatcher> logger)
        {
            _logger = logger;
        }
        
        public IDisposable Subscribe(IObserver<Indexer> observer)
        {
            _logger.LogInformation("Subscribing observer {Observer}", observer);
            var subscriber = _subject.Subscribe(observer);
            _logger.LogInformation("Subscribed observer {Observer}", observer);
            return subscriber;
        }

        public void OnCompleted()
        {
            _logger.LogInformation("IndexWatcher: Start OnCompleted");
            _subject.OnCompleted();
            _logger.LogInformation("IndexWatcher: End OnCompleted");
        }

        public void OnError(Exception error)
        {
            _logger.LogError(error, "IndexWatcher: Start OnError");
            _subject.OnError(error);
            _logger.LogError("IndexWatcher: End OnError");
        }

        public void OnNext(Indexer value)
        {
            _logger.LogInformation("IndexWatcher: Start OnNext");
            _subject.OnNext(value);
            _logger.LogInformation("IndexWatcher: End OnNext");
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ApiServer.TimerFeatures
{
    public class TimerManager
    {
        private Timer _timer;
        private AutoResetEvent _autoResetEvent;
        private Action _action;

        public DateTime TimerStarted { get; set; }

        public TimerManager(Action action)
        {
            _action = action;
            _autoResetEvent = new AutoResetEvent(false);
            _timer = new Timer(Execute, _autoResetEvent, 1000, 2000);
            TimerStarted = DateTime.Now;
        }
        /* Action : Her iki saniyede bir geçirilen geri arama işlevini yürütmek için bir temsilci kullanıyoruz.
         * Zamanlayıcı, ilk çalıştırmadan önce bir saniyelik bir duraklama yapacaktır.
         * Son olarak, sınırsız zamanlayıcı döngüsünden kaçınmak için yürütme için altmış saniyelik bir zaman aralığı oluşturuyoruz.
         * */
        private void Execute(object state)
        {
            _action();

            if ((DateTime.Now - TimerStarted).Seconds > 60)
            {
                _timer.Dispose();
            }
        }
    }
}

using ApiServer.TimerFeatures;
using Microsoft.AspNetCore.SignalR;
using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Client.Disconnecting;
using MQTTnet.Client.Options;
using MQTTnet.Client.Subscribing;
using MQTTnet.Client.Unsubscribing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Timers;
using System.Threading.Tasks;
using System.Diagnostics;  // Bu kodu kütüphaneye ekliyoruz.
using System.Text.Json;
using System.IO;

namespace ApiServer.Hubs
{

    public class WeatherForecast
    {
        public List<string> topicleri = new List<string>();
        public  int QoS { get; set; }
        public float counti { get; set; }
        public string weat { get; set; }
    }


    public class MqttHub : Hub
    {
        // bakelor/pr14/prod/+/s
        // a2.pr14.bakelor.com

        #region definition
        public static string topic = "";
        public static float count = 0;
        public static int countSecond = 0;
        public static int QoS;


        static List<string> clients = new List<string>(); public static List<string> topicler = new List<string>();

        public static string username = ""; public static string passw = "";
        public static string grName = ""; public static string _serverName = "";

        public static string topicN = ""; public static string QoSN = ""; public static string messsageN = "";


        static string first;
        static string last;

        static TimeSpan girisCikisFarki;
        static string calismaSuresi;
        #endregion

        static float deneme = 0;


        #region MQTT
        static IMqttClient mqttClient = null;

        public static void ConnectClient()
        {
            try
            {
                var options = new MqttClientOptionsBuilder().WithTcpServer(_serverName).WithCredentials(username, passw).WithCleanSession().Build();
                var factory = new MqttFactory();

                mqttClient = factory.CreateMqttClient();
                //Subscribe();


                var ct = new System.Threading.CancellationToken();
                var result = mqttClient.ConnectAsync(options, ct).GetAwaiter().GetResult();
            }
            catch (Exception e)
            {
                Debug.WriteLine(e);
            }
        }

        public static void Subscribe()
        {

            var options = new MqttClientOptionsBuilder().WithTcpServer("a2.pr14.bakelor.com").WithCredentials("drony", "drony").WithCleanSession().Build();
            var factory = new MqttFactory();

            mqttClient = factory.CreateMqttClient();

            mqttClient.UseConnectedHandler(ConnectionHandler);
            var timerManager = new TimerManager(() => mqttClient.UseApplicationMessageReceivedHandler(MessageHandler));
            var ct = new System.Threading.CancellationToken();
            var result = mqttClient.ConnectAsync(options, ct).GetAwaiter().GetResult();
        }


        //        public object CPUKullanimYuzdesiHesapla()
        //        {
        //            PerformanceCounter cpuCounter = new PerformanceCounter();
        //            cpuCounter.CategoryName = "Processor";
        //            cpuCounter.CounterName = "% Processor Time";
        //            cpuCounter.InstanceName = "_Total";

        //            dynamic firstValue = cpuCounter.NextValue();
        //            System.Threading.Thread.Sleep(1000);
        //            dynamic secondValue = cpuCounter.NextValue();

        //            System.Threading.Thread.Sleep(1000);
        //            dynamic secondValue1 = cpuCounter.NextValue();

        //            System.Threading.Thread.Sleep(1000);
        //            dynamic secondValue2 = cpuCounter.NextValue();

        //            return (secondValue + secondValue1 + secondValue2) / 3;



        ////var currentProcess = Process.GetCurrentProcess().ProcessName;
        ////            PerformanceCounter privateBytes =
        ////                new PerformanceCounter(categoryName: "Process", counterName: "Private Bytes", instanceName: currentProcess);
        ////            PerformanceCounter gen2Collections =
        ////                new PerformanceCounter(categoryName: ".NET CLR Memory", counterName: "# Gen 2 Collections", instanceName: currentProcess);
        ////            Debug.WriteLine("private bytes = " + privateBytes.NextValue());
        ////            Debug.WriteLine("gen 2 collections = " + gen2Collections.NextValue());
        //        }

        static string[] mesajlar;
        static Task ConnectionHandler(MQTTnet.Client.Connecting.MqttClientConnectedEventArgs arg)
        {
            mqttClient.SubscribeAsync(new MqttClientSubscribeOptionsBuilder().WithTopicFilter(grName).Build()).GetAwaiter().GetResult();
            //var message = "mesaj";
            //mqttClient.PublishAsync(message, CancellationToken.None);

            //mqttClient.UnsubscribeAsync(new MQTTnet.Client.Unsubscribing.MqttClientUnsubscribeOptionsBuilder().WithTopicFilter(grName).Build()).GetAwaiter().GetResult();
            return Task.CompletedTask;
        }


        public static void DisconnectTopic()
        {
            mqttClient.UseDisconnectedHandler(DisconnectedHandler);
        }

        private static Task DisconnectedHandler(MqttClientDisconnectedEventArgs arg)
        {
            mqttClient.UnsubscribeAsync(new MQTTnet.Client.Unsubscribing.MqttClientUnsubscribeOptionsBuilder().WithTopicFilter(grName).Build()).GetAwaiter().GetResult();
            return Task.CompletedTask;
        }

        static float isteMesaj;

        static async Task MessageHandler(MqttApplicationMessageReceivedEventArgs e)
        {
            count++;
            
            isteMesaj = count / deneme;
            if (topicler.Count == 0)
            {
                first = DateTime.Now.ToLongTimeString();
            }
            else
            {
                last = DateTime.Now.ToLongTimeString();
            }

            await Task.Run(() =>
            {
                topicler.Add($"+ Topic = {e.ApplicationMessage.Topic}");
                string neymis = e.ApplicationMessage.ToString();
                QoS = ((int)e.ApplicationMessage.QualityOfServiceLevel);
                countSecond = 0;

                mesajlar = new string[e.ApplicationMessage.Payload.Length];

                for (int i = 0; i < mesajlar.Length; i++)
                {
                    mesajlar[i] = ((char)e.ApplicationMessage.Payload[i]).ToString();
                }
            });

            var weatherForecast = new WeatherForecast
            {
                topicleri = { { e.ApplicationMessage.Topic } },
                QoS = ((int)e.ApplicationMessage.QualityOfServiceLevel),
                counti = count,
                weat = "selam",

            };



            string fileName = "WeatherForecast.json";
            string jsonString = JsonSerializer.Serialize(weatherForecast);
            File.WriteAllText(fileName, jsonString);
            //Console.WriteLine(File.ReadAllText(fileName));


            #region asenkron
            //string fileName = "WeatherForecast.json";
            //using FileStream createStream = File.Create(fileName);
            //await JsonSerializer.SerializeAsync(createStream, weatherForecast);
            //await createStream.DisposeAsync(); 
            #endregion




            girisCikisFarki = DateTime.Parse(last).Subtract(DateTime.Parse(first));
            calismaSuresi = girisCikisFarki.ToString();
            countSecond = 0;



        }
        #endregion

        protected IHubContext<MqttHub> _context { get; }

        public MqttHub(IHubContext<MqttHub> context)
        {

            _context = context;
        }


        public override async Task OnConnectedAsync()
        {
            var Id = Guid.NewGuid().ToString();
            await _context.Clients.All.SendAsync("gUid", Id);

            clients.Add(Context.ConnectionId);
            await _context.Clients.All.SendAsync("clients", clients);
            await _context.Clients.All.SendAsync("userJoined", Context.ConnectionId);

        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var Id = Guid.NewGuid().ToString();
            await _context.Clients.All.SendAsync("gUid", Id);
            clients.Remove(Context.ConnectionId);
            await _context.Clients.All.SendAsync("clients", clients);
            await _context.Clients.All.SendAsync("userLeaved", Context.ConnectionId);
        }

        public async Task SendMessageAsync(string userName, string password, string serverName)
        {
            #region definition
            username = userName;
            passw = password;
            _serverName = serverName;
            #endregion

            //await _context.Clients.All.SendAsync("mqttConnect", "true");
            ConnectClient();

            
            if (mqttClient.IsConnected)
            {
                await Clients.Caller.SendAsync("mqttConnect", "true");
            }
            else
            {
                await Clients.Caller.SendAsync("mqttConnect", "false");
            }
        }
        public async Task SendGroupNameAsync(string groupName)
        {
            await _context.Clients.All.SendAsync("groupName", groupName);
        }

        public async Task ListenerGroupAsync(string groupName)
        {
            #region definition
            grName = groupName;
            #endregion

            Subscribe();

            var timerManager = new TimerManager(() =>
                _context.Clients.All.SendAsync("topics", topicler, count, first, last, calismaSuresi, Math.Round(isteMesaj, 2), QoS, mesajlar)
            );

            await _context.Clients.All.SendAsync("topics", topicler, count);
            var timerYonetim = new TimerManager(() =>
                deneme ++
            );

            count = 0;
        }

        public void cancel()
        {
            //mqttClient.UnsubscribeAsync(grName);
            mqttClient.UnsubscribeAsync(new MQTTnet.Client.Unsubscribing.MqttClientUnsubscribeOptionsBuilder().WithTopicFilter(grName).Build()).GetAwaiter().GetResult();
        }

        public async Task UnsubscribeAsync(string groupName)
        {
            grName = groupName;
            cancel();
            topicler.Clear(); count = 0;
            await _context.Clients.All.SendAsync("oldumu", "");
        }


        public async Task Publish(string topicName, string QoSName, string message)
        {
            topicN = topicName;
            QoSN = QoSName;
            messsageN = message;

            await _context.Clients.All.SendAsync("oldumu", "");
        }

    }
}

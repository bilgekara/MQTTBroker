import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import * as signalR from '@microsoft/signalr';
import { CookieService } from 'ngx-cookie-service';
import { uid } from 'uid';

interface group{
  groupName: string
}

interface topics{
  topic: string
}


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy{

  public signalDurumu: any = "Waiting Connection..."
  public _mqttConnect = '';  clickSubscribe = false; clickMute = false;
  
  //interface
  groups: group[] = [] 
  topics: topics[] = []
  MyClient: any[] = []

  connection; totalClient: number;

  serverName: string = "a2.pr14.bakelor.com"; userName: string; password: string; url: string;             topicPublish: string; messagePublish: string; // subscribe - publish 
  // ID
  connectionId: any; clientId: any; _guid: any;
  // table
  count: any; lastTime: any = new Date(); firstTime: any = new Date(); duration: any; speedSecond: any; QoS: any
 
  toppings: FormGroup;


  constructor( private cookie: CookieService, fb: FormBuilder ) {
    this.connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/mqtthub")
    .withAutomaticReconnect()
    .build();

    this.toppings = fb.group({
      jsonCheck: false,
    });
   console.log("djfvbg",fb.group);
    
  }

  
  ngOnInit(): void {


    this.startConnection();
    this.connectMqtt();
    this.gruplarıGetir();

    this.connection.on("gUid", (GUID: any) => {
      this._guid = GUID ; 
      console.log("guid",GUID);
    });
  }

  ngOnDestroy(){

  }
  
  async startConnection() {
    try{
      await this.connection.start()
      .then( () =>{
        this.signalDurumu="Connection Success"
      });
    }
    catch(error) {
      setTimeout(() => this.startConnection(), 2000);
    }
    
    this.connection.onreconnecting((err: any) => {
      this.signalDurumu = 'Reconnecting';
    });

    this.connection.onreconnected((err: any) => {
      this.signalDurumu = 'Connection Success';
    });

    this.connection.onclose((err: any) => {
      this.signalDurumu = 'Connection Closed';
    });

    this.connection.on("userJoined", (connectionId: string) => {
      this.connectionId = connectionId;
      console.log("UserJoined", connectionId);


      for (let index = 0; index < this.MyClient.length; index++) {
        const element = this.MyClient[index]; 
        this.totalClient = element.length;
      }

      console.log("Client Number Joined", this.MyClient.length);

    });

    this.connection.on("userLeaved", (connectionId: string) => {
      console.log("userLeaved: ", connectionId);
      this.MyClient.slice(1,1);
           
      for (let index = 0; index < this.MyClient.length; index++) {
        const element = this.MyClient[index];
        this.totalClient = element.length;
      }

      console.log("Client Number Leaved", this.totalClient);

    });

    this.connection.on("clients", (clientsData: string) => {      
      this.MyClient.push(clientsData);
      console.log(this.MyClient.length);
    });

  }

  connectMqtt(){
    localStorage.setItem('userName',this.userName);
    localStorage.setItem('password',this.password);
    localStorage.setItem('serverName',this.serverName);


    this.connection.send("SendMessageAsync", this.getLocalStorageName(), this.getLocalStoragePassw(), this.getLocalStorageServer())
    .then(() => {
        console.log("SendMessageAsync"); 
    })
    .catch((error: any): void => console.log(`mesaj gonderillirken hata olustu. ${error}`));
    
    //burada true mı degil mi bilgisini alıyorum
    this.connection.on("mqttConnect", (mqttConnect: any) => {
      console.log("baglandi mi->", mqttConnect);
      this.cookie.set('mqttConnect', mqttConnect);
      this._mqttConnect = mqttConnect ; 
    });

    this.IsCookieExist();
  }
  
  sendMessage(){

    console.log("ne sendler oldu burdaaa");
    this.connection.send("SendGroupNameAsync", this.url)
    .then(() => {
      console.log("SendGroupNameAsync"); 
    })
    .catch((error: any): void => console.log(`mesaj gonderillirken hata olustu. ${error}`));
    this.GrubuDinle(this.url);

    this.clickSubscribe = true;
  }

  gruplarıGetir(){
    console.log("gruba girdim");
    this.connection.on("groupName", (grupAdi: string) => {
     console.log("aha da olmiştir bu iş")
      this.groups.push({
       groupName:grupAdi
      })
    });
  }
  bendenemeyim: string;
  // subscribe
  GrubuDinle(grupAdi: string){

    this.connection.send("ListenerGroupAsync", grupAdi)
    .then(() => {
      console.log("ListenerGroupAsync->", grupAdi); 
    })
    .catch((error: any): void => console.log(`mesaj gonderillirken hata olustu. ${error}`));
    
    this.connection.on("topics",
    (mqttTopic: any, count: any, firstTime: any, lastTime: any, calismaSuresi: any, speedSecond: any, QoS: any, mesajlar: any) => 
    {
      console.log("calissana artiiik");
      this.topics.pop();
      this.count = count; this.lastTime = lastTime; this.firstTime = firstTime;
      this.duration = calismaSuresi; this.QoS = QoS; this.speedSecond = speedSecond;
      this.topics.push({
        topic: mqttTopic
      })
      console.log("dmks -> ", mesajlar);
      this.bendenemeyim = mesajlar;
    });
  }

  Unsubscribe(grupAdi: string){

    this.groups.forEach( (item, index) => {
      if(item.groupName == grupAdi){
        this.groups.splice(index,1);
      }
    });

    // this.firstTime.setHours(24,0,0,0);
    // this.lastTime.setHours(24,0,0,0); this.duration = null; this.count = null; this.QoS = null;

    
    this.connection.send("UnsubscribeAsync", grupAdi)
    .then(() => {
      console.log("UnsubscribeAsync->", grupAdi); 
    })
    .catch((error: any): void => console.log(`mesaj gonderillirken hata olustu. ${error}`));

    this.connection.on("oldumu", (mqttTopic: any) => {
      console.log("oldumu");
    });
  }

  Mute(grupAdi: string){

    if(this.clickMute == true){
      this.GrubuDinle(grupAdi);
      this.clickMute = false;
    }
    else{
      this.connection.send("UnsubscribeAsync", grupAdi)
      .then(() => {
        console.log("UnsubscribeAsync->", grupAdi); 
      })
      .catch((error: any): void => console.log(`mesaj gonderillirken hata olustu. ${error}`));
  
      this.connection.on("oldumu", (mqttTopic: any) => {
        console.log("oldumu");
      });
      this.clickMute = true;
    }
  }

  // -------------
  //publish

  Publish(){
    this.connection.send("Publish", this.topicPublish, "", this.messagePublish)
      .then(() => {
        console.log("Publish->"); 
      })
      .catch((error: any): void => console.log(`mesaj gonderillirken hata olustu. ${error}`));
  
      this.connection.on("oldumu", (mqttTopic: any) => {
        console.log("oldumu");
      });
  }

  logOut(){
    this.delLocalStorage();
    this.cookie.delete('userId');
    this.cookie.set('mqttConnect', 'false');
    this._mqttConnect = 'false';
  }

  getGroup(): group[] {
    return this.groups.filter(i=>i) ;
  }

  getTopic(): topics[]{
    return this.topics.filter(i=>i);
  }


  getLocalStorageName(){
    return localStorage.getItem('userName');
  }
  getLocalStoragePassw(){
    return localStorage.getItem('password')
  }
  getLocalStorageServer(){
    return localStorage.getItem('serverName')
  }
  delLocalStorage(){
    localStorage.removeItem('userName');
    localStorage.removeItem('password');
  }

  getSessionStorageClientId(){
    return sessionStorage.getItem('ClientId');
  }

  getCookie() {
    //console.log("get cookie", this.cookie.get('userId'));
    return this.cookie.get('userId');
  }


  
  getMqttConnect(){
    return this.cookie.get('mqttConnect');
  }

  IsCookieExist(){
    var myCookie = this.cookie.get("userId");
    if (myCookie == "") {
      this.cookie.set("userId", uid());
      console.log("ulan yok bu");
    }
    else {
      console.log("var salak")  ; 
    }  
  }

}

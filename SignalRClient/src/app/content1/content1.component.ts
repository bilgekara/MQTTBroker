import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl,Validators } from '@angular/forms';
import* as signalR from '@microsoft/signalr';
import { CookieService } from 'ngx-cookie-service';
import { uid } from 'uid';

interface MyClient{
  clientData: string,
}

interface group{
  topics: string,
  topics2: string,
}

interface mqttData{
  data: string,
}

@Component({
  selector: 'app-content1',
  templateUrl: './content1.component.html',
  styleUrls: ['./content1.component.css']
})

export class Content1Component implements OnInit {

  // expression
  title = "Veriler";

  my_client: MyClient[] = []
  groups: group[] = []
  mqttData: mqttData[] = []

  userControl = new FormControl('');   usrName: string = "";
  passControl = new FormControl('');   usrPassw: string = "";
  url = new FormControl('');           groupName: string = "";

  connectId = ""; clickSubscribe = false; name = ""; count = 0; itemList: string[]  ;
  olacak: string[] = ['1','2','3','4','5','6']

  public signalDurumu: any = sessionStorage.getItem('signalDurumu');

  // public signalDurumu: string = 'Waiting connection....';
  connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5000/myhub")
  .withAutomaticReconnect()
  .build();

  /* http için kullancağım parametreler */
  parametre1: any; parametre2: any; parametre3: any; parametre4: any

  constructor(private cookie: CookieService, private http: HttpClient) { 
    sessionStorage.setItem('signalDurumu','Waiting connection....');
  }

  
  ngOnInit(): void {
    
  }

  // api(){
  //   this.connection.send("transferchartdata", "slm")
  //   .then(() => {
  //       console.log("username,value-> olduysan havalara ucariiiim"); 
  //   })
  //   .catch((error: any): void => console.log(`mesaj gonderillirken hata olustu. ${error}`));


  //   var uri = "http://localhost:5000/api/home";
  //   var dene ="/deneme"
  //   console.log("->",uri+dene);
  //   this.http.get(uri+dene).subscribe( res => {
  //     console.log("bu bir res'tir ->", res);
  //   uri});

  //   this.connection.on("pullMessage", (grupAdi: string, text: string) => {
  //     console.log("api->",grupAdi);
  //     console.log("api2 ->", text);
  //   });
  // }

  async startConnection() {
    try{
      await this.connection.start()
      .then( () =>{
        this.signalDurumu="Connection Success"
        sessionStorage.setItem('signalDurumu', this.signalDurumu);
      });
    }
    catch(error) {
      setTimeout(() => this.startConnection(), 2000);
    }
    
    this.connection.onreconnecting((err: any) => {
      this.signalDurumu = 'Reconnecting';
      sessionStorage.setItem('signalDurumu', this.signalDurumu);
    });

    this.connection.onreconnected((err: any) => {
      this.signalDurumu = 'Connection Success';
      sessionStorage.setItem('signalDurumu', this.signalDurumu);
    });

    this.connection.onclose((err: any) => {
      this.signalDurumu = 'Connection Closed';
      sessionStorage.setItem('signalDurumu', this.signalDurumu);
    });

    this.connection.on("userJoined", (connectionId: string) => {
      console.log("userJoined: ", connectionId);
      this.connectId= connectionId;
    });

    this.connection.on("userLeaved", (connectionId: string) => {
      console.log("userLeaved: ", connectionId);
    });

    this.connection.on("clients", (clientsData: string) => { // giren clientlar
      this.my_client.push({
        clientData: clientsData
      })
    });
    this.gruplarıGetir();
  }

  httpGetRequest(){
    var url = "http://localhost:5000/api/home";

    console.log(":)", this.parametre3);
    // if(this.parametre4!=""){
    //   var get = url+"/"+this.parametre1+"/"+this.parametre2+"/"+this.parametre3+"/"+this.parametre4;
    // }else 
    if(this.parametre3!=""){
      var get = url+"/"+this.parametre1+"/"+this.parametre2+"/"+this.parametre3;
    }else if(this.parametre2!=""){
      var get = url+"/"+this.parametre1+"/"+this.parametre2;
    }else if(this.parametre3!=""){
      var get = url+"/"+this.parametre1;
    }else{
      var get = url;
    }

    this.http.get(get).subscribe( res => {
      console.log("bu bir res'tir ->", res);
    });

  }

  gruplarıGetir(){
    console.log("gruba girdim");
    this.groups.push({
      topics: "",
      topics2: ""
    })
    this.connection.on("pullMessage", (grupAdi: string, text: string) => {
     console.log("aha da olmiştir bu iş")
      this.groups.push({
       topics: grupAdi,
       topics2: text
     })
   });
  }
  

  connectMqtt(){
    this.IsCookieExist();
    localStorage.setItem('userName',this.userControl.value);
    localStorage.setItem('password',this.passControl.value);

    this.userControl.setValue('');
    this.passControl.setValue('');   

    this.startConnection();
  }
  
  sendMessage(){
    console.log("namw->", this.name);
     this.connection.send("SendMessageAsync", this.getLocalStorageName(), this.getLocalStoragePassw(), this.url.value, this.connectId)
      .then(() => {
          console.log("SendMessageAsync"); 
          this.clickSubscribe = true;
      })
      .catch((error: any): void => console.log(`mesaj gonderillirken hata olustu. ${error}`));
      this.url.setValue('');
    /* Kullanıcı bilgilerini gönderme */
    // this.parametre1="";this.parametre2="";this.parametre3="";
    // this.parametre1 = this.getLocalStorageName(); this.parametre2 = this.getLocalStoragePassw(); 
    // this.parametre3 = this.url.value; // this.parametre4 = this.connectId;

    // this.httpGetRequest(); 


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

  logOut(){
    this.cookie.delete('userId');
    this.delLocalStorage();
    sessionStorage.removeItem('signalDurumu');
    // sessionStorage.setItem('signalDurumu','Connection Closed');
  }

  getGroup(): group[] {
    return this.groups.filter(i=>i) ;
  }
  getTopic(): mqttData[]{
    console.log("calisti serefsiz");

    return this.mqttData.filter(i=>i) ;
  }

  getCookie() {;
    return this.cookie.get('userId');
  }

  getLocalStorageName(){
    return localStorage.getItem('userName');
  }
  getLocalStoragePassw(){
    return localStorage.getItem('password')
  }
  delLocalStorage(){
    localStorage.removeItem('userName');
    localStorage.removeItem('password');
    // localStorage.clear();
  }

  GrubuDinle(){
    console.log("Kaçılın kraliçe geliyoor");

    // this.parametre1="";this.parametre2="";this.parametre3="";

    // this.httpGetRequest();
    // this.connection.send("transferchartdata")
    //   .then(() => {
    //       console.log("transferchartdata"); 
    //   })
    //   .catch((error: any): void => console.log(`mesaj gonderillirken hata olustu. ${error}`));

    // this.connection.on("transferchartdata", (topic: string) => {
    //   console.log("toopiic->",topic);
    //    this.mqttData.push({
    //     data: topic,
    //   })
    // });
    
  }

  GrubtanAyril(){
    // this.parametre1="";this.parametre2="";this.parametre3="";
    // this.parametre1=this.connectId; this.parametre2= this.url.value; this.parametre3="false"
    console.log("ayriliyo muaun");
    // // this.httpGetRequest();
    this.connection.send("removeGroup", this.connectId, this.url.value)
    .then(() => {
        console.log("buraya girmwi lazom"); 
    })
    .catch((error: any): void => console.log(`mesaj gonderillirken hata olustu. ${error}`));
    
  }
  GrubaKatil(){
    
    var url = "http://localhost:5000/api/home";

    this.http.get(url).subscribe( res => {
      console.log("bu bir res'tir ->", res);

    });

    // this.mqttData.push({
    //   data: ""
    // })

    // for (let i = 0; i <= this.itemList.length; i++) {
    //   this.itemList.splice(i, 1)
    // }

    console.log("niye");
    this.connection.on("transferchartdata", (grupAdi: string) => {
      // this.mqttData.pop();

      this.mqttData.push({
        data: grupAdi
      })

      // this.itemList.push(grupAdi);

      this.count ++;
      console.log("api->",grupAdi);
      // console.log("---", this.itemList)

    });
  console.log( "uğaramıyosub");


    // this.connection.send("addGroup", this.connectId, this.url.value)
    // .then(() => {
    //     console.log("buraya girmwi lazom"); 
    // })
    // .catch((error: any): void => console.log(`mesaj gonderillirken hata olustu. ${error}`));
  }
}

// constructor(private cookie: CookieService, private http: HttpClient) { 
//   sessionStorage.setItem('signalDurumu','Waiting connection....');
//   for(var i=0; i<100; i++){
//     this.itemList.push(+i)
//   }
// }

// scrollToTop(el:any) {
//   el.scrollTop = 0;
// }
import * as signalR from "@microsoft/signalr";
import { Topic } from "./topic";

export class TopicRepository {
    private topics: Topic[];
    //connection;
    constructor() {

        this.topics = [

        ]

    }

    getTopics(): Topic[] {
        return this.topics;
    }

    filteredTopic(calismaSuresi:any): Topic[] {
        return this.topics.filter(i=>i.calismaSuresi === calismaSuresi);
    }
}
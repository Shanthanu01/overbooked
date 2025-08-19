from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from typing import Any, Text, List, Dict
from datetime import datetime
import pymongo
import re
from typing import Any, Dict, List, Text

# MongoDB setup
client = pymongo.MongoClient("mongodb+srv://santhosh2210429:9003203594@eventdatabase.u5mhw.mongodb.net/")
db = client["test"]  # Database name
events_collection = db["events"]  # Collection name for storing event details

# Custom action to show event details
class ActionShowEventDetails(Action):
    def name(self) -> Text:
        return "action_show_event_details"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Fetch event details from MongoDB
        event_details = events_collection.find({})  # Get all events

        # If events exist, return the details
        if event_details:
            dispatcher.utter_message(text="Here are the details of all upcoming events:")
            for event in event_details:
                dispatcher.utter_message(text=f"Event: {event['title']}\nArtist: {event['artist_name']}\nDate: {event['date']}\nLocation: {event['location']}\nPrice: {event['final_price']}")
        else:
            dispatcher.utter_message(text="Sorry, there are no events available at the moment.")
        
        return []
    
class ActionShowEventsByArtist(Action):
    def name(self) -> Text:
        return "action_show_events_by_artist"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Extract the artist_name entity from the tracker
        artist_name = next(tracker.get_latest_entity_values("artist_name"), None)
        
        # Debugging: Print or log the extracted entity
        print(f"Extracted artist_name: {artist_name}")
        
        # If artist name exists, normalize it to handle case and extra spaces
        if artist_name:
            artist_name = artist_name.strip().lower()

            # Query MongoDB for events by artist
            events_by_artist = events_collection.find({"artist_name": {"$regex": f"^{re.escape(artist_name)}$", "$options": "i"}})
            
            # Convert cursor to list
            events_list = list(events_by_artist)

            if events_list:
                dispatcher.utter_message(text=f"Here are the events performed by {artist_name.title()}:")
                for event in events_list:
                    dispatcher.utter_message(text=f"Event: {event['title']}\nDate: {event['date']}\nLocation: {event['location']}\nPrice: {event['final_price']}")
            else:
                dispatcher.utter_message(text=f"Sorry, I couldn't find any events for {artist_name.title()}.")
        else:
            dispatcher.utter_message(text="Sorry, I couldn't find any artist by that name.")
        
        return []

class ActionHandleArtistQueries(Action):
    def name(self) -> Text:
        return "action_handle_artist_queries"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        # Extract the user input
        user_message = tracker.latest_message['text'].strip().lower()

        # Handle different user queries with regex
        if re.search(r"show me events by (.*)", user_message):
            artist_name = re.search(r"show me events by (.*)", user_message).group(1).strip()
            tracker.slots['artist_name'] = artist_name
            dispatcher.utter_message(text=f"Fetching events for {artist_name.title()}...")
            return [SlotSet("artist_name", artist_name)]
        
        elif re.search(r"tell me about the events (.*)", user_message):
            artist_name = re.search(r"tell me about the events (.*)", user_message).group(1).strip()
            tracker.slots['artist_name'] = artist_name
            dispatcher.utter_message(text=f"Fetching events for {artist_name.title()}...")
            return [SlotSet("artist_name", artist_name)]

        elif re.search(r"(.*) performing at any event", user_message):
            artist_name = re.search(r"(.*) performing at any event", user_message).group(1).strip()
            tracker.slots['artist_name'] = artist_name
            dispatcher.utter_message(text=f"Fetching events for {artist_name.title()}...")
            return [SlotSet("artist_name", artist_name)]

        # Default response if no artist name is found
        dispatcher.utter_message(text="I couldn't find any events for the requested artist.")
        return []

# Custom action to show upcoming events
class ActionShowUpcomingEvents(Action):
    def name(self) -> Text:
        return "action_show_upcoming_events"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        upcoming_month = datetime.now().strftime("%B %Y")
        
        # Query MongoDB for upcoming events (this could be modified to show events after today's date)
        upcoming_events = events_collection.find({"date": {"$gte": datetime.now().strftime("%Y-%m-%d")}})

        if upcoming_events:
            dispatcher.utter_message(text=f"Here are the events happening in {upcoming_month}:")
            for event in upcoming_events:
                dispatcher.utter_message(text=f"Event: {event['title']}\nArtist: {event['artist_name']}\nDate: {event['date']}\nLocation: {event['location']}\nPrice: {event['final_price']}")
        else:
            dispatcher.utter_message(text="Sorry, there are no upcoming events.")
        
        return []

# Custom action to show events by price range
class ActionShowEventsByPrice(Action):
    def name(self) -> Text:
        return "action_show_events_by_price"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        price_range = next(tracker.get_latest_entity_values("price_range"), None)
        
        if price_range:
            # Extract min and max price from the range (assuming it's like "$50-$100")
            try:
                min_price, max_price = map(int, price_range.replace('$', '').split('-'))
                # Query MongoDB for events within the price range
                price_range_events = events_collection.find({
                    "price": {"$gte": min_price, "$lte": max_price}
                })

                if price_range_events:
                    dispatcher.utter_message(text=f"Here are the events within the price range of {price_range}:")
                    for event in price_range_events:
                        dispatcher.utter_message(text=f"Event: {event['title']}\nArtist: {event['artist_name']}\nDate: {event['date']}\nLocation: {event['location']}\nPrice: {event['final_price']}")
                else:
                    dispatcher.utter_message(text=f"Sorry, I couldn't find any events in the price range of {price_range}.")
            except Exception as e:
                dispatcher.utter_message(text="Sorry, there was an error processing the price range.")
        else:
            dispatcher.utter_message(text="Sorry, I couldn't find any events in that price range.")
        
        return []

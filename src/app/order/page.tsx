"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, CheckCircle, X, Loader2, Minus, Plus, Upload, AlertCircle, MapPin, Clock } from "lucide-react";
import { BUILDING_COLLEGE, BUILDING_COORDS, BUILDINGS_BY_COLLEGE } from "@/lib/orderStore";
import { isHallOpen, hallOpenLabel } from "@/lib/campus";
import type { HallId, CollegeId } from "@/lib/pricing";

// Map frontend hall IDs → pricing engine HallId
const HALL_TO_PRICING_ID: Record<string, HallId> = {
  "64deg":    "sixty4",
  "pines":    "pines",
  "sixth":    "sixthDining",
  "ovt":      "ovt",
  "ventanas": "ventanas",
  "canyon":   "canyon",
  "bistro":   "bistro",
};

// Map building college display string → pricing engine CollegeId
const COLLEGE_TO_PRICING_ID: Record<string, CollegeId> = {
  "Revelle College":   "revelle",
  "Muir College":      "muir",
  "Marshall College":  "marshall",
  "Warren College":    "warren",
  "Roosevelt College": "erc",
  "Sixth College":     "sixth",
  "Seventh College":   "seventh",
  "Eighth College":    "eighth",
};

// UCSD campus bounding box
// Bounding box covers main campus + Theatre District + off-campus UC housing (Miramar St)
const UCSD = { swLat: 32.8630, swLng: -117.2460, neLat: 32.8960, neLng: -117.2115 };
function isOnCampus(lat: number, lng: number) {
  return lat >= UCSD.swLat && lat <= UCSD.neLat && lng >= UCSD.swLng && lng <= UCSD.neLng;
}

const HALLS = [
  { id: "64deg",    name: "64 Degrees",   college: "Revelle",        emoji: "🍳", lat: 32.8735, lng: -117.2420, bg: "bg-orange-50",  border: "border-orange-200" },
  { id: "pines",    name: "Pines",         college: "Muir",           emoji: "🌮", lat: 32.8793, lng: -117.2378, bg: "bg-green-50",   border: "border-green-200"  },
  { id: "sixth",    name: "Sixth Market",  college: "Sixth",          emoji: "🥗", lat: 32.8830, lng: -117.2420, bg: "bg-sky-50",     border: "border-sky-200"    },
  { id: "ovt",      name: "OceanView",     college: "Roosevelt",      emoji: "🍜", lat: 32.8764, lng: -117.2363, bg: "bg-purple-50",  border: "border-purple-200" },
  { id: "ventanas", name: "Café Ventanas", college: "Warren",         emoji: "☕", lat: 32.8836, lng: -117.2372, bg: "bg-amber-50",   border: "border-amber-200"  },
  { id: "canyon",   name: "Canyon Vista",  college: "Marshall",       emoji: "🌯", lat: 32.8752, lng: -117.2405, bg: "bg-rose-50",    border: "border-rose-200"   },
  { id: "bistro",   name: "The Bistro",    college: "Seventh/Eighth", emoji: "🥪", lat: 32.8850, lng: -117.2402, bg: "bg-indigo-50",  border: "border-indigo-200" },
];

const MENUS: Record<string, { category: string; items: { name: string; price: number }[] }[]> = {
  "64deg": [
    { category: "🍔 Triton Grill", items: [
      { name: "Black Bean Burger Combo", price: 11.50 },
      { name: "Triton Cheeseburger Combo", price: 12.00 },
      { name: "Chicken Tender Combo", price: 11.75 },
      { name: "Crispy Chicken Sandwich Combo", price: 11.75 },
      { name: "California Burger", price: 11.00 },
      { name: "Mediterranean Burger", price: 11.25 },
      { name: "Triton Cheeseburger", price: 10.50 },
      { name: "Chipotle Black Bean Burger", price: 10.75 },
      { name: "TJ Baja Hot Dog", price: 9.00 },
      { name: "Three Cheese Grilled Cheese", price: 9.00 },
      { name: "Plant Based Crispy Chikn Sandwich", price: 11.00 },
      { name: "Buffalo Chicken Wing Basket", price: 11.50 },
      { name: "Fish and Chips", price: 12.00 },
      { name: "Crispy Chicken Sandwich", price: 10.75 },
      { name: "Chipotle Pesto Chicken Sandwich", price: 11.00 },
      { name: "Triton Dog", price: 9.00 },
      { name: "Chicken Tender Combo", price: 11.75 },
      { name: "Curly Fries", price: 4.00 },
      { name: "Lattice Fries", price: 4.00 },
      { name: "Cilantro Garlic Spring Vegetables", price: 3.50 },
      { name: "Grilled Chicken Breast", price: 5.00 },
    ]},
    { category: "🥢 Wok", items: [
      { name: "Orange Chicken Rice Bowl", price: 11.00 },
      { name: "Manchurian Tofu Rice Bowl", price: 10.50 },
      { name: "Peppered Beef Rice Bowl", price: 11.50 },
      { name: "Orange Chicken Noodle Bowl", price: 11.00 },
      { name: "Manchurian Tofu Noodle Bowl", price: 10.50 },
      { name: "Peppered Beef Noodle Bowl", price: 11.50 },
      { name: "Pan Fried Noodles", price: 10.00 },
      { name: "Salt and Pepper Wings", price: 10.50 },
      { name: "Steamed Pork Bun", price: 4.50 },
      { name: "Spring Rolls", price: 5.00 },
      { name: "Chicken Potstickers", price: 6.00 },
      { name: "Wok Fired Spring Vegetables", price: 4.00 },
      { name: "Chinese Egg Tart", price: 4.00 },
      { name: "Matcha Milk Boba Tea", price: 5.50 },
      { name: "Taro Milk Tea with Boba", price: 5.50 },
      { name: "Boba Oatmilk Tea", price: 5.50 },
    ]},
    { category: "🌮 Taqueria", items: [
      { name: "Birria Bowl", price: 11.00 },
      { name: "Mushroom Asada Bowl", price: 10.50 },
      { name: "Carnitas Bowl", price: 11.00 },
      { name: "Chicken Al Pastor Bowl", price: 11.00 },
      { name: "Birria Burrito", price: 10.50 },
      { name: "Beans and Cheese Burrito", price: 8.50 },
      { name: "Baja Fish Burrito", price: 11.00 },
      { name: "Mushroom Asada Burrido", price: 10.50 },
      { name: "Chicken Al Pastor Burrito", price: 11.00 },
      { name: "Carnitas Burrito", price: 10.50 },
      { name: "Birria Fries", price: 7.50 },
      { name: "Cheese Fries", price: 5.50 },
      { name: "Mushroom Asada Fries", price: 7.50 },
      { name: "Carnitas Fries", price: 7.50 },
      { name: "Chicken Al Pastor Fries", price: 7.50 },
      { name: "Birria Quesadilla", price: 9.50 },
      { name: "Cheese Quesadilla", price: 8.00 },
      { name: "Mushrooom Asada Quesadilla", price: 9.50 },
      { name: "Chicken Al Pastor Quesadilla", price: 9.50 },
      { name: "Carnitas Quesadilla", price: 9.50 },
      { name: "Birria Tacos (2)", price: 9.00 },
      { name: "San Diego Fish Tacos (2)", price: 9.50 },
      { name: "Mushroom Asada Tacos (2)", price: 8.50 },
      { name: "Chicken Al Pastor Tacos (2)", price: 9.00 },
      { name: "Carnitas Tacos (2)", price: 9.00 },
      { name: "Quesabirria Tacos Plate", price: 12.00 },
      { name: "Chips and Guacamole", price: 4.50 },
      { name: "Chips and Salsa", price: 3.50 },
      { name: "Mexican Red Rice", price: 3.00 },
      { name: "Cantina Beans", price: 3.00 },
      { name: "Grandmas Chocolate Cheesecake", price: 5.00 },
      { name: "Flan", price: 4.50 },
    ]},
    { category: "🍝 Al Dente", items: [
      { name: "Roasted Garlic Fettucine Alfredo", price: 11.00 },
      { name: "Farfalle Arrabbiata Primavera", price: 10.50 },
      { name: "Gnocchi Pesto Pomodorini", price: 11.00 },
      { name: "Pesto Pasta Side Salad", price: 4.50 },
      { name: "Caprese Side Salad", price: 4.50 },
      { name: "Roasted Garlic Breadstick", price: 3.00 },
      { name: "Classic Rigatoni Bolognese", price: 11.50 },
    ]},
    { category: "🥗 64 Garden Bar", items: [
      { name: "Thai Tempeh Hoagie", price: 10.50 },
      { name: "Chicken Club Sandwich", price: 11.00 },
      { name: "Pines BLT", price: 10.00 },
      { name: "Turkey Pesto Sandwich", price: 10.50 },
      { name: "64 Caesar Salad", price: 7.50 },
      { name: "Blackened Chicken Taco Salad", price: 10.00 },
      { name: "Chicekn Pecan Salad", price: 10.00 },
      { name: "Southwest Grain Bowl", price: 10.50 },
      { name: "Asain Chopped Salad", price: 9.50 },
      { name: "Side Classic Caesar Salad", price: 4.50 },
      { name: "Albondigas Soup", price: 5.00 },
    ]},
    { category: "🍣 Umi", items: [
      { name: "Albacore Nigiri (2)", price: 7.00 },
      { name: "Hamachi Nigiri (2)", price: 7.50 },
      { name: "Salmon Nigiri (2)", price: 7.00 },
      { name: "Umi Mixed Nigiri", price: 12.00 },
      { name: "Miso Salmon Inari", price: 7.50 },
      { name: "Spicy Tuna Inari", price: 7.50 },
      { name: "Seared Ahi - Salmon Chirashi", price: 13.00 },
      { name: "Salmon - Hamaschi Chirashi", price: 13.00 },
      { name: "Sweet Heat Roll", price: 11.00 },
      { name: "Sea King Roll", price: 11.50 },
      { name: "Spicy Tuna Tempura Shrimp Roll", price: 12.00 },
      { name: "Umi Roll", price: 10.50 },
      { name: "Rainbow Roll", price: 11.00 },
      { name: "Spicy Salmon Roll", price: 10.50 },
      { name: "Mushroom Asparagus Roll", price: 9.50 },
      { name: "Edamame", price: 4.00 },
      { name: "Cucumber Kimchi", price: 4.00 },
      { name: "Miso Soup", price: 3.00 },
      { name: "Yuzu Tart", price: 5.00 },
    ]},
    { category: "🍰 Desserts & Snacks", items: [
      { name: "Chocolate Chunk Cookie", price: 2.75 },
      { name: "Oatmeal Raisin Cookie", price: 2.75 },
      { name: "White Chocolate Macadamia Cookie", price: 2.75 },
      { name: "Apple", price: 2.00 },
      { name: "Banana", price: 1.75 },
      { name: "Orange", price: 2.00 },
    ]},
    { category: "🥤 Drinks", items: [
      { name: "Fountain Drink", price: 3.00 },
    ]},
  ],

  "pines": [
    { category: "🌮 Coming Fall 2025", items: [
      { name: "Tacos (2pc)", price: 9.00 },
      { name: "Burrito Bowl", price: 10.25 },
      { name: "Quesadilla", price: 8.75 },
      { name: "Street Corn Salad", price: 7.50 },
    ]},
    { category: "🥤 Drinks", items: [
      { name: "Fountain Drink", price: 3.00 },
    ]},
  ],

  "sixth": [
    { category: "🌯 Wolftown", items: [
      { name: "Wolftown Burrito", price: 10.50 },
      { name: "Wolftown Burrito Bowl", price: 10.50 },
      { name: "Wolftown Nachos", price: 10.00 },
      { name: "Chips and Guacamole", price: 4.50 },
      { name: "Cantina Beans", price: 3.00 },
      { name: "Spanish Rice", price: 3.00 },
      { name: "Tortilla Chips", price: 3.00 },
      { name: "Chocolate Chunk Cookie", price: 2.75 },
      { name: "Oatmeal Raisin Cookie", price: 2.75 },
      { name: "White Chocolate Macadamia Cookie", price: 2.75 },
      { name: "Churro", price: 3.50 },
      { name: "Apple", price: 2.00 },
      { name: "Banana", price: 1.75 },
      { name: "Orange", price: 2.00 },
    ]},
    { category: "🥗 Crave", items: [
      { name: "Mediterranean Grain Bowl with Chicken", price: 11.00 },
      { name: "Spring Bounty Bowl with Chicken", price: 11.00 },
      { name: "Udon Noodle Salad with Chicken", price: 11.00 },
      { name: "Spring Bounty Bowl with Tempeh", price: 10.50 },
      { name: "Mediterranean Grain Bowl with Tempeh", price: 10.50 },
      { name: "Udon Noodle Salad with Tempeh", price: 10.50 },
      { name: "Galbi Tempeh Banh Mi Sandwich", price: 10.50 },
      { name: "Stinging Chicken Banh Mi Sandwich", price: 11.00 },
      { name: "Strawberry Fields Tempeh Wrap", price: 10.00 },
      { name: "Berry Tart", price: 4.50 },
      { name: "Chocolate Chunk Cookie", price: 2.75 },
      { name: "Oatmeal Raisin Cookie", price: 2.75 },
      { name: "White Chocolate Macadamia Cookie", price: 2.75 },
      { name: "Apple", price: 2.00 },
      { name: "Banana", price: 1.75 },
      { name: "Orange", price: 2.00 },
    ]},
    { category: "🍜 Noodles", items: [
      { name: "Chicken Ramen", price: 11.00 },
      { name: "Pork Ramen", price: 11.50 },
      { name: "Tofu Ramen", price: 10.50 },
      { name: "Chocolate Chunk Cookie", price: 2.75 },
      { name: "Oatmeal Raisin Cookie", price: 2.75 },
      { name: "White Chocolate Macadamia Cookie", price: 2.75 },
    ]},
    { category: "🔥 Rooftop", items: [
      { name: "Pulled Pork Plate", price: 12.00 },
      { name: "Smoked Brisket Plate", price: 13.00 },
      { name: "Ancho Lime Chicken Plate", price: 12.00 },
      { name: "Brisket Sandwich Plate", price: 12.50 },
      { name: "Pulled Pork Sandwich Plate", price: 12.00 },
      { name: "Pork Chile Verde Loaded Fries", price: 10.00 },
      { name: "Pork Chile Verde Loaded Mac n Cheese", price: 10.50 },
      { name: "Triton Cheeseburger Combo", price: 12.00 },
      { name: "Chicken Tender Combo", price: 11.75 },
      { name: "Crispy Chicken Sandwich Combo", price: 11.75 },
      { name: "Plant Based Beyond Burger", price: 11.50 },
      { name: "California Burger", price: 11.00 },
      { name: "Plant Based Crispy Chickn Sandwich", price: 11.00 },
      { name: "Chicken Tenders", price: 10.50 },
      { name: "Waffle Fries", price: 4.00 },
      { name: "Mac and Cheese", price: 5.00 },
      { name: "Cilantro Garlic Spring Vegetables", price: 3.50 },
      { name: "Jalapeno Cilantro Coleslaw", price: 3.50 },
      { name: "Cornbread", price: 3.00 },
      { name: "Sides Sampler Plate", price: 7.00 },
      { name: "Apple Cobbler", price: 5.00 },
      { name: "Chocolate Chunk Cookie", price: 2.75 },
      { name: "Oatmeal Raisin Cookie", price: 2.75 },
      { name: "White Chocolate Macadamia Cookie", price: 2.75 },
      { name: "Apple", price: 2.00 },
      { name: "Banana", price: 1.75 },
      { name: "Orange", price: 2.00 },
    ]},
    { category: "🌺 Makai Poke", items: [
      { name: "Cali Poke Greens Bowl", price: 12.00 },
      { name: "Makai Poke Greens Bowl", price: 12.00 },
      { name: "Lava Poke Greens Bowl", price: 12.00 },
      { name: "Lilo Poke Greens Bowl", price: 12.00 },
      { name: "Chimichurri Octopus Greens Bowl", price: 13.00 },
      { name: "Cali Poke Rice Bowl", price: 12.00 },
      { name: "Makai Poke Rice Bowl", price: 12.00 },
      { name: "Lava Poke Rice Bowl", price: 12.00 },
      { name: "Lilo Poke Rice Bowl", price: 12.00 },
      { name: "Chimichurri Octopus Rice Bowl", price: 13.00 },
      { name: "Brown Rice", price: 3.00 },
      { name: "Steamed Rice", price: 3.00 },
      { name: "Chocolate Chunk Cookie", price: 2.75 },
      { name: "Oatmeal Raisin Cookie", price: 2.75 },
      { name: "White Chocolate Macadamia Cookie", price: 2.75 },
    ]},
    { category: "🌴 Wolftown Street", items: [
      { name: "Huli Huli chicken Plate", price: 12.00 },
      { name: "White Rice", price: 3.00 },
      { name: "Hawaiian Mac Salad", price: 4.00 },
      { name: "Huli Huli Tofu Plate", price: 11.50 },
      { name: "Mango Coleslaw", price: 3.50 },
      { name: "Hawaiian Chicken Wings", price: 10.50 },
      { name: "Apple", price: 2.00 },
      { name: "Banana", price: 1.75 },
      { name: "Orange", price: 2.00 },
    ]},
    { category: "🥤 Drinks", items: [
      { name: "Fountain Drink", price: 3.00 },
    ]},
  ],

  "ovt": [
    { category: "🥙 Spice", items: [
      { name: "Psari Plaki Salmon Plate", price: 13.50 },
      { name: "Beef Kofta Garlic Fries", price: 11.00 },
      { name: "Chicken Shawarma Garlic Fries", price: 11.00 },
      { name: "Crispy Tofu Garlic Fries", price: 10.50 },
      { name: "Falafel Garlic Fries", price: 10.00 },
      { name: "Chicken Shawarma Greek Salad", price: 11.50 },
      { name: "Falafel Greek Salad", price: 10.50 },
      { name: "Beef Kofta Kebab Greek Salad", price: 12.00 },
      { name: "Salmon Greek Salad", price: 13.00 },
      { name: "Crispy Tofu Greek Salad", price: 10.50 },
      { name: "Chicken Shawarma Mazza Bowl", price: 12.00 },
      { name: "Falafel Mazza Bowl", price: 11.00 },
      { name: "Salmon Mazza Bowl", price: 13.50 },
      { name: "Crispy Tofu Mazza Bowl", price: 11.00 },
      { name: "Beef Kofta Kebab Mazza Bowl", price: 12.50 },
      { name: "Chicken Shawarma Medi Plate", price: 12.00 },
      { name: "Falafel Medi Plate", price: 11.00 },
      { name: "Salmon Medi Plate", price: 13.50 },
      { name: "Beef Kofta Kebab Medi Plate", price: 12.50 },
      { name: "Crispy Tofu Medi Plate", price: 11.00 },
      { name: "Beef Kofta Kebab Pita", price: 10.50 },
      { name: "Chicken Shawarma Pita", price: 10.50 },
      { name: "Crispy Tofu Pita", price: 9.50 },
      { name: "Falafel Pita", price: 9.50 },
      { name: "Bulgur Tabbouleh", price: 4.50 },
      { name: "Shepards Salad", price: 4.50 },
      { name: "Basmati Rice", price: 3.00 },
      { name: "Pita Bread", price: 2.50 },
      { name: "Garlic Fries", price: 5.00 },
      { name: "Falafel with Sauce", price: 5.00 },
      { name: "Lemon Tumeric Rice", price: 3.50 },
      { name: "Harissa Roasted Vegetables", price: 4.00 },
      { name: "Pita with Roasted Garlic Hummus", price: 4.00 },
      { name: "Israeli Chickpea Salad", price: 4.50 },
      { name: "Apple", price: 2.00 },
      { name: "Banana", price: 1.75 },
      { name: "Orange", price: 2.00 },
    ]},
    { category: "🍕 Scholar's Pizza", items: [
      { name: "Signature Cheese Pizza", price: 13.00 },
      { name: "Margherita Pizza", price: 13.00 },
      { name: "Pepperoni Pizza", price: 14.00 },
      { name: "Cali Chicken Bacon Ranch Pizza", price: 14.50 },
      { name: "Spicy Meat Lovers Pizza", price: 14.50 },
      { name: "Chicken Pesto Pizza", price: 14.00 },
      { name: "Chipotle Soyrizo Black Bean Pizza", price: 13.50 },
      { name: "Sausage Pesto Ricotta Pizza", price: 14.00 },
      { name: "The 4.0", price: 14.50 },
      { name: "Apple", price: 2.00 },
      { name: "Banana", price: 1.75 },
      { name: "Orange", price: 2.00 },
    ]},
    { category: "🍝 Scholar's Italian", items: [
      { name: "Spring Pasta Primavera", price: 11.00 },
      { name: "Classic Red Top Detroit Pizza", price: 7.50 },
      { name: "Old World Pepperoni Detroit Pizza", price: 8.00 },
      { name: "Spicy BBQ Chicken Detroit Pizza", price: 8.00 },
      { name: "Spaghetti with Marinara", price: 10.00 },
      { name: "Spaghetti and Turkey Meatballs", price: 11.50 },
      { name: "OV Side Caesar Salad", price: 4.50 },
      { name: "OV Side Salad", price: 4.00 },
      { name: "Signature Cheese Pizza Slice", price: 5.00 },
      { name: "Cup n Char Pepperoni Slice", price: 5.50 },
      { name: "Chicken Pesto Artichoke Pizza Slice", price: 6.00 },
      { name: "Jalapeno Garlic Cheesy Bread", price: 4.50 },
      { name: "BYO Salad", price: 8.00 },
      { name: "Apple", price: 2.00 },
      { name: "Banana", price: 1.75 },
      { name: "Orange", price: 2.00 },
    ]},
    { category: "🥤 Drinks", items: [
      { name: "Fountain Drink", price: 3.00 },
    ]},
  ],

  "ventanas": [
    { category: "🍔 Soul", items: [
      { name: "Triton Burger", price: 11.50 },
      { name: "Pimento Cheeseburger", price: 11.75 },
      { name: "Louisiana Blackened Cheeseburger", price: 12.00 },
      { name: "BBQ Bacon Burger", price: 12.25 },
      { name: "Crispy Chicken Sandwich", price: 11.00 },
      { name: "Alabama Crispy Chicken Sandwich", price: 11.25 },
      { name: "Plant Baed Crispy Chickn Sandwich", price: 11.00 },
      { name: "Pulled Pork Sandwich", price: 11.00 },
      { name: "Crispy Fried Catfish Sandwich", price: 11.50 },
      { name: "Pimento Grilled Cheese", price: 9.50 },
      { name: "Surf and Turf Po Boy", price: 13.00 },
      { name: "Mac n Cheese with Fried Chicken", price: 11.50 },
      { name: "Mac n Cheese with Beyond Sausage", price: 11.00 },
      { name: "Nashville Grilled Chicken Basket", price: 11.50 },
      { name: "Soul Chicken Tender Basket", price: 11.00 },
      { name: "Fried Potato Wedges", price: 4.50 },
      { name: "Onion Rings", price: 4.50 },
      { name: "Mac and Cheese", price: 5.00 },
      { name: "Southern Slaw", price: 3.50 },
      { name: "Marinated Chicken Breast", price: 6.00 },
      { name: "Cajun Popcorn Shrimp Basket", price: 11.00 },
      { name: "Hot Honey Fried Chicken Plate", price: 12.00 },
      { name: "Beignets", price: 5.50 },
      { name: "Orange Vanilla Crème Beignet", price: 5.50 },
      { name: "Banana Pudding", price: 5.00 },
      { name: "Chocolate Chunk Cookie", price: 2.75 },
      { name: "Oatmeal Raisin Cookie", price: 2.75 },
      { name: "White Chocolate Macadamia Cookie", price: 2.75 },
      { name: "Apple", price: 2.00 },
      { name: "Banana", price: 1.75 },
      { name: "Orange", price: 2.00 },
    ]},
    { category: "🌍 Journey", items: [
      { name: "Tumeric Chicken Wings Bowl", price: 11.50 },
      { name: "Bhajias Cauliflower Bowl", price: 10.50 },
      { name: "Kan Kan Chicken Bowl", price: 12.00 },
      { name: "Berbere Honey Glazed Chicken Wings", price: 11.00 },
      { name: "Bhajias Cauliflower Tacos Plate", price: 10.50 },
      { name: "Kan Kan Chicken Thigh Tacos Plate", price: 12.00 },
      { name: "Tumeric Wings Plate", price: 11.50 },
      { name: "Arayes Beef Wrap", price: 11.00 },
      { name: "Kan Kan Chicken Loaded Fries", price: 11.00 },
      { name: "Chapati Flatbread", price: 3.50 },
      { name: "Mitmita Roasted Carrots", price: 4.00 },
      { name: "Lemon and Spinach Cous Cous", price: 4.00 },
      { name: "Nigerian Fried Rice", price: 4.50 },
      { name: "Shuku Shuku", price: 4.50 },
      { name: "Chocolate Chunk Cookie", price: 2.75 },
      { name: "Oatmeal Raisin Cookie", price: 2.75 },
      { name: "White Chocolate Macadamia Cookie", price: 2.75 },
      { name: "Apple", price: 2.00 },
      { name: "Banana", price: 1.75 },
      { name: "Orange", price: 2.00 },
    ]},
    { category: "🌴 Vibe", items: [
      { name: "Jerk Chicken Pasta", price: 11.50 },
      { name: "Carribean Curry Pasta", price: 11.00 },
      { name: "Jerk Chicken Plate", price: 12.00 },
      { name: "Coconut Fried Chicken Plate", price: 12.00 },
      { name: "Citrico y Sazon Chicken Wings Basket", price: 11.00 },
      { name: "BBQ Jerk Chicken Sanwich", price: 11.00 },
      { name: "Pan con Lechon Sandwich", price: 11.00 },
      { name: "Jerk Chicken Chop Salad", price: 10.50 },
      { name: "Moros", price: 3.50 },
      { name: "Carribean Mango Slaw", price: 3.50 },
      { name: "Jerked Sweet Potato Fries", price: 4.50 },
      { name: "Flan de Coco", price: 5.00 },
      { name: "Chocolate Chunk Cookie", price: 2.75 },
      { name: "Oatmeal Raisin Cookie", price: 2.75 },
      { name: "White Chocolate Macadamia Cookie", price: 2.75 },
    ]},
    { category: "🥟 HaPi", items: [
      { name: "Roasted Corn and Poblano Handpie", price: 6.50 },
      { name: "Pizza Pocket Handpie", price: 6.50 },
      { name: "Potato and Cheese Handpie", price: 6.50 },
      { name: "Jamaican Beef Patty Handpie", price: 7.00 },
      { name: "Apple Turnover Handpie", price: 6.00 },
      { name: "Argentinian Empanada", price: 6.50 },
      { name: "Chocolate Cheesecake Handpie", price: 6.00 },
      { name: "Strawberry Nutella Handpie", price: 6.00 },
      { name: "Handpie Sampler Plate", price: 14.00 },
    ]},
    { category: "🍛 Tandoor", items: [
      { name: "Papdi Chaat", price: 8.50 },
      { name: "Vegetable Samosa", price: 5.50 },
      { name: "Palak Paneer Plate", price: 11.50 },
      { name: "Chicken Makhani Plate", price: 12.00 },
      { name: "Tandoor Chicken Plate", price: 12.00 },
      { name: "Tandoor Chicken Loaded Naan", price: 12.00 },
      { name: "Kachumber Salad", price: 4.00 },
      { name: "Tandoor Chicken Wrap", price: 11.00 },
      { name: "Paneer Palak Wrap", price: 10.50 },
      { name: "Butter Naan", price: 3.00 },
      { name: "Naan Plain", price: 2.50 },
      { name: "Garlic Naan", price: 3.00 },
      { name: "Basmati Rice", price: 3.00 },
      { name: "Black Dal Maharashtra", price: 4.50 },
      { name: "Chana Masala Side", price: 4.50 },
      { name: "Chocolate Chunk Cookie", price: 2.75 },
      { name: "Oatmeal Raisin Cookie", price: 2.75 },
      { name: "White Chocolate Macadamia Cookie", price: 2.75 },
      { name: "Apple", price: 2.00 },
      { name: "Banana", price: 1.75 },
      { name: "Orange", price: 2.00 },
    ]},
    { category: "🥤 Drinks", items: [
      { name: "Fountain Drink", price: 3.00 },
    ]},
  ],

  "canyon": [
    { category: "🍔 Fusion", items: [
      { name: "CV Single Smash Burger Combo", price: 12.00 },
      { name: "CV Plant Based Burger Combo", price: 12.00 },
      { name: "Halal Chicken Tenders Combo", price: 11.75 },
      { name: "Crispy Chicken Sandwich Combo", price: 11.75 },
      { name: "Brakfast Smashburger", price: 11.00 },
      { name: "CV Single Smashburger", price: 10.50 },
      { name: "CV Plant Based Burger", price: 10.50 },
      { name: "Korean BBQ Smashburger", price: 11.50 },
      { name: "Birria Dip Burger", price: 12.00 },
      { name: "Chicken Tenders Halal", price: 10.50 },
      { name: "Crispy Chicken Sandwich", price: 10.75 },
      { name: "Korean Crispy Chicken Sandwich", price: 11.25 },
      { name: "Buffalo Wings and Fries", price: 11.00 },
      { name: "Korean Wings and Fries", price: 11.25 },
      { name: "Korean Loaded Chicken Fries", price: 11.00 },
      { name: "Korean Plant Based Loaded Fries", price: 10.50 },
      { name: "Korean Beef Loaded Fries", price: 11.50 },
      { name: "Salmon Sandwich", price: 11.50 },
      { name: "Grilled Cheese", price: 8.50 },
      { name: "Banh Mi Chicken Sandwich", price: 11.00 },
      { name: "Grilled Chicken Breast Only", price: 5.50 },
      { name: "French Fries", price: 4.00 },
      { name: "Grilled Garlic Asparagus", price: 4.50 },
      { name: "Chocolate Chunk Cookie", price: 2.75 },
      { name: "Oatmeal Raisin Cookie", price: 2.75 },
      { name: "White Chocolate Macadamia Cookie", price: 2.75 },
      { name: "Apple", price: 2.00 },
      { name: "Banana", price: 1.75 },
      { name: "Orange", price: 2.00 },
    ]},
    { category: "🔥 360", items: [
      { name: "Hibachi Chicken Plate", price: 12.00 },
      { name: "Togarashi Tofu Plate", price: 11.00 },
      { name: "Teppanyaki Shrimp Plate", price: 13.00 },
      { name: "Teppanyaki Steak Plate", price: 14.00 },
      { name: "Chahan Fried Rice", price: 10.00 },
      { name: "Teppanyaki Vegetables", price: 9.00 },
      { name: "Tsukemono Takuan Salad", price: 4.00 },
      { name: "Matcha Mochi Cake", price: 5.00 },
      { name: "Chocolate Chunk Cookie", price: 2.75 },
      { name: "Oatmeal Raisin Cookie", price: 2.75 },
      { name: "White Chocolate Macadamia Cookie", price: 2.75 },
    ]},
    { category: "🥗 Fresh", items: [
      { name: "Pastrami Crusted Chicken Sandwich", price: 11.50 },
      { name: "Salpicon Beef Sandwich", price: 11.50 },
      { name: "Char Siu Chicken Banh Mi", price: 11.00 },
      { name: "Salpicon Beef Wrap", price: 11.00 },
      { name: "Kale Caesar Salad", price: 8.50 },
      { name: "BYO Poke Bowl", price: 12.00 },
      { name: "Salmon Chop Salad", price: 11.50 },
      { name: "Vietnamese Rice Noodle Salad", price: 10.50 },
      { name: "Char Siu Chicken Chop Salad", price: 11.00 },
      { name: "Caldo de Papa Norteno", price: 7.00 },
      { name: "Bibingka", price: 5.50 },
      { name: "Smores Pie", price: 5.50 },
      { name: "Chocolate Chunk Cookie", price: 2.75 },
      { name: "Oatmeal Raisin Cookie", price: 2.75 },
      { name: "White Chocolate Macadamia Cookie", price: 2.75 },
      { name: "Apple", price: 2.00 },
      { name: "Banana", price: 1.75 },
      { name: "Orange", price: 2.00 },
    ]},
    { category: "🌺 360 Quick Service", items: [
      { name: "Huli Huli Chicken Plate", price: 12.00 },
      { name: "Huli Huli Tofu Plate", price: 11.50 },
      { name: "Hawaiian Mac Salad", price: 4.00 },
      { name: "Jasmine Rice", price: 3.00 },
    ]},
    { category: "🥤 Drinks", items: [
      { name: "Acai Banana Smoothie", price: 6.50 },
      { name: "Matcha Mango Smoothie", price: 6.50 },
      { name: "Fountain Drink", price: 3.00 },
      { name: "Apple", price: 2.00 },
      { name: "Banana", price: 1.75 },
      { name: "Orange", price: 2.00 },
    ]},
  ],

  "bistro": [
    { category: "🍽 Bistro", items: [
      { name: "Edamame", price: 4.50 },
      { name: "Appetizer Sampler Plate", price: 12.00 },
      { name: "Mushroom Karaage Plate", price: 11.50 },
      { name: "Korean BBQ Wings", price: 11.00 },
      { name: "Pork Bun with Cucumber Salad", price: 10.50 },
      { name: "Dumplings in Chili Oil", price: 9.50 },
      { name: "Spicy Curry Seared Tofu", price: 10.50 },
      { name: "Mt. Fuji Salad with Chicken", price: 11.00 },
      { name: "Mt. Fuji Salad with Salmon", price: 12.50 },
      { name: "Tofu Udon Stir Fry", price: 11.00 },
      { name: "Gochujang Udon with Shrimp and Pork", price: 12.50 },
      { name: "Chicken Fried Rice with Fried Egg", price: 11.00 },
      { name: "Shrimp Fried Rice with Fried Egg", price: 12.00 },
      { name: "Beef Machado Bowl", price: 12.50 },
      { name: "Sauteed Salmon", price: 13.00 },
      { name: "Shrimp Miso Mac and Cheese", price: 12.00 },
      { name: "Chicken Udon Stir Fry", price: 11.50 },
      { name: "Miso Soup", price: 3.50 },
      { name: "Sushi Rice", price: 3.00 },
      { name: "Seaweed Salad", price: 4.50 },
      { name: "Cucumber Salad", price: 4.00 },
      { name: "Basque Cheesecake with Miso Caramel", price: 6.00 },
      { name: "Green Tea Ice Cream", price: 5.00 },
      { name: "Vietnameses Tres Leches Cake", price: 5.50 },
      { name: "Thai Mango Sticky Rice", price: 5.50 },
    ]},
    { category: "🍣 Bistro Sushi", items: [
      { name: "California Roll", price: 8.50 },
      { name: "Philly Roll", price: 9.50 },
      { name: "Crunchy Roll", price: 9.50 },
      { name: "Dragon Roll", price: 11.00 },
      { name: "Rainbow Roll", price: 11.50 },
      { name: "Sun God Roll", price: 10.50 },
      { name: "Plant Based Lava Roll", price: 9.50 },
      { name: "Spicy Tuna Roll", price: 10.00 },
      { name: "The OC Roll", price: 11.00 },
      { name: "Green Tea Ice Cream", price: 5.00 },
      { name: "Thai Mango Sticky Rice", price: 5.50 },
    ]},
    { category: "🥤 Drinks", items: [
      { name: "Boba Oatmilk Tea", price: 5.50 },
      { name: "Matcha Milk Boba Tea", price: 5.50 },
      { name: "Taro Milk Tea with Boba", price: 5.50 },
    ]},
  ],
};

// Derive drink item names from menu categories that contain "Drinks"
const DRINK_NAMES = new Set(
  Object.values(MENUS).flatMap(groups =>
    groups
      .filter(g => g.category.includes("Drinks") || g.category.includes("☕"))
      .flatMap(g => g.items.map(i => i.name))
  )
);

type Extracted = {
  pid_last4: string | null;
  order_number: string | null;
  dining_hall: string | null;
  items: string[] | null;
  pickup_time: string | null;
  total: string | null;
};

function OrderPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"hall" | "station" | "items">("hall");
  const [stationIdx, setStationIdx] = useState(0);
  const [hall, setHall] = useState("");
  const [locationStatus, setLocationStatus] = useState<"idle"|"ok"|"offcampus"|"denied">("idle");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [triton, setTriton] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [extracted, setExtracted] = useState<Extracted | null>(null);
  const [ocrError, setOcrError] = useState(false);
  const [ocrErrorMsg, setOcrErrorMsg] = useState("");
  const [manualLast4, setManualLast4] = useState("");
  const [manualOrderNum, setManualOrderNum] = useState("");
  const [manualPickupTime, setManualPickupTime] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [building, setBuilding] = useState("");

  // Ask for location on mount to verify student is on campus
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocationStatus(isOnCampus(pos.coords.latitude, pos.coords.longitude) ? "ok" : "offcampus"),
      () => setLocationStatus("denied"),
      { timeout: 8000 }
    );
  }, []);

  // Redirect back to /home if the student already has an active order
  useEffect(() => {
    const existingId = localStorage.getItem("dorm_dash_order_id");
    if (!existingId) return;
    fetch(`/api/orders/${existingId}`)
      .then(r => { if (!r.ok) { localStorage.removeItem("dorm_dash_order_id"); return null; } return r.json(); })
      .then(d => {
        if (d?.order && d.order.status !== "delivered") {
          router.replace("/home");
        } else {
          localStorage.removeItem("dorm_dash_order_id");
        }
      })
      .catch(() => {});
  }, [router]);
  const [toDoor, setToDoor] = useState(false);
  const [room, setRoom] = useState("");
  const [scheduleMode, setScheduleMode] = useState(false);
  const [scheduledFor, setScheduledFor] = useState("");
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill delivery address from saved profile
  useEffect(() => {
    const savedBuilding = localStorage.getItem("user_building");
    const savedRoom     = localStorage.getItem("user_room");
    if (savedBuilding) setBuilding(savedBuilding);
    if (savedRoom)     setRoom(savedRoom);
  }, []);

  // Deep-link from home page hall chips e.g. /order?hall=64deg
  useEffect(() => {
    const hallParam = searchParams.get("hall");
    if (hallParam && MENUS[hallParam]) {
      setHall(hallParam);
      setCart({});
      setStep("station");
    }
  }, [searchParams]);

  const menu = MENUS[hall] ?? [];
  const allItems = menu.flatMap((g) => g.items);

  const add = (name: string) =>
    setCart((c) => ({ ...c, [name]: (c[name] ?? 0) + 1 }));
  const sub = (name: string) =>
    setCart((c) => {
      const next = { ...c, [name]: (c[name] ?? 1) - 1 };
      if (next[name] <= 0) delete next[name];
      return next;
    });

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [name, qty]) => {
    const price = allItems.find((i) => i.name === name)?.price ?? 0;
    return sum + price * qty;
  }, 0);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setExtracted(null);
    setOcrError(false);
    setOcrErrorMsg("");
    setAnalyzing(true);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        const res = await fetch("/api/analyze-screenshot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType: ["image/jpeg","image/png","image/gif","image/webp"].includes(f.type) ? f.type : "image/jpeg" }),
          signal: controller.signal,
        });
        const json = await res.json();
        if (json.success) setExtracted(json.data);
        else { setOcrError(true); setOcrErrorMsg(json.error ?? "Unknown error"); }
      } catch (err) {
        setOcrError(true);
        setOcrErrorMsg(err instanceof Error && err.name === "AbortError" ? "Timed out — try a smaller screenshot" : "Network error");
      } finally {
        clearTimeout(timeout);
      }
      setAnalyzing(false);
    };
    reader.readAsDataURL(f);
  };

  const clearFile = () => {
    setFile(null); setPreview(null); setExtracted(null); setOcrError(false); setOcrErrorMsg("");
    setManualLast4(""); setManualOrderNum(""); setManualPickupTime("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const canSubmit = hall && cartCount > 0 && triton && building && (!toDoor || room.trim().length > 0);

  const hallData = HALLS.find((h) => h.id === hall);
  const currentStation = menu[stationIdx];

  const goBack = () => {
    if (step === "items") setStep("station");
    else if (step === "station") { setStep("hall"); }
  };

  const saveAndGo = async () => {
    if (submitting) return;
    setSubmitting(true);
    setApiError("");
    const hallData = HALLS.find((h) => h.id === hall);
    const destCoords = BUILDING_COORDS[building] ?? { lat: 32.8800, lng: -117.2340 };
    const deliveryCollege = BUILDING_COLLEGE[building] ?? "";

    // Build cart with type info for pricing engine
    const cartPayload = Object.entries(cart).map(([name, qty]) => ({
      name,
      quantity: qty,
      type: DRINK_NAMES.has(name) ? "drink" : "food",
    }));
    const cartStrings = Object.entries(cart).map(([name, qty]) => `${qty}× ${name}`);

    const payload = {
      hall:          HALL_TO_PRICING_ID[hall] ?? hall,
      college:       COLLEGE_TO_PRICING_ID[deliveryCollege] ?? "sixth",
      hallEmoji:     hallData?.emoji   ?? "🍽",
      hallCollege:   hallData?.college ?? "",
      hallLat:       hallData?.lat     ?? 32.8800,
      hallLng:       hallData?.lng     ?? -117.2340,
      cart:          cartPayload,
      pid_last4:     extracted?.pid_last4    ?? (manualLast4.trim()      || null),
      pickup_time:   extracted?.pickup_time  ?? (manualPickupTime.trim() || null),
      order_number:  extracted?.order_number ?? (manualOrderNum.trim()   || null),
      building,
      deliveryCollege,
      destLat:       destCoords.lat,
      destLng:       destCoords.lng,
      room:          toDoor ? room.trim() : null,
      deliverToRoom: toDoor,
      toDoor,
      scheduledFor:  scheduleMode && scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
    };

    try {
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();

      if (!res.ok) {
        setApiError(data.error ?? "Failed to place order. Please try again.");
        setSubmitting(false);
        return;
      }

      localStorage.setItem("dorm_dash_order_id", data.id);

      // Persist to student history using the API's authoritative total
      try {
        const entry = {
          id: data.id,
          hall: data.order?.hall ?? hallData?.name ?? "",
          hallEmoji: hallData?.emoji ?? "🍽",
          hallCollege: hallData?.college ?? "",
          cart: cartStrings,
          total: `$${Number(data.order?.total ?? 0).toFixed(2)}`,
          building,
          room: toDoor ? room.trim() : null,
          toDoor,
          status: "pending",
          placedAt: new Date().toISOString(),
          scheduledFor: scheduleMode && scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
        };
        const prev = JSON.parse(localStorage.getItem("student_history") ?? "[]");
        localStorage.setItem("student_history", JSON.stringify([entry, ...prev]));
      } catch {}

      router.push("/home");
    } catch (err) {
      setApiError("Network error — please check your connection and try again.");
      setSubmitting(false);
      console.error("Order submission failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">

      {/* ── Header ── */}
      <div className="bg-[#003087] px-5 pt-14 pb-6 text-white relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"/>

        {step !== "hall" ? (
          <button onClick={goBack} className="text-white/60 text-sm flex items-center gap-1 mb-4 press">
            <ChevronLeft size={16}/>
            {step === "items" ? (hallData?.name ?? "Stations") : "Dining Halls"}
          </button>
        ) : (
          <Link href="/home" className="text-white/60 text-sm flex items-center gap-1 mb-4">
            <ChevronLeft size={16}/> Home
          </Link>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black animate-slide-down">
              {step === "hall" ? "Dining Halls" :
               step === "station" ? (hallData?.name ?? "") :
               (currentStation?.category.replace(/^\S+\s*/, "") ?? "")}
            </h1>
            <p className="text-white/60 text-sm mt-1">
              {step === "hall" ? "Where are you ordering from?" :
               step === "station" ? `${hallData?.emoji ?? ""} Choose a station` :
               `${hallData?.name ?? ""} · ${currentStation?.items.length ?? 0} items`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {locationStatus === "ok" && (
              <span className="flex items-center gap-1 bg-green-500/20 text-green-300 text-xs font-bold px-2.5 py-1.5 rounded-full">
                <MapPin size={11}/> On Campus
              </span>
            )}
            {locationStatus === "offcampus" && (
              <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold px-2.5 py-1.5 rounded-full">
                <MapPin size={11}/> Off Campus
              </span>
            )}
          </div>
        </div>

        {/* Breadcrumb */}
        {step !== "hall" && (
          <div className="flex items-center gap-1.5 mt-3 text-xs text-white/50 flex-wrap">
            <span>New Order</span>
            {hallData && <><ChevronRight size={11}/><span className="text-white/70">{hallData.name}</span></>}
            {step === "items" && currentStation && (
              <><ChevronRight size={11}/><span className="text-white/90">{currentStation.category.replace(/^\S+\s*/, "")}</span></>
            )}
          </div>
        )}
      </div>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-6 pb-36 flex flex-col gap-6">

        {/* ── STEP 1: Dining Hall grid ── */}
        {step === "hall" && (
          <div className="grid grid-cols-2 gap-2.5 animate-fade-in">
            {HALLS.map((d, i) => {
              const open = isHallOpen(d.id);
              const openLabel = hallOpenLabel(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => { setHall(d.id); setCart({}); setStep("station"); }}
                  className={`flex flex-col items-start p-3.5 rounded-2xl border-2 transition text-left lift press animate-pop-in stagger-${(i % 6) + 1} ${d.bg} ${d.border} ${!open ? "opacity-60" : ""}`}
                >
                  <div className="w-full flex items-start justify-between mb-2">
                    <span className="text-3xl">{d.emoji}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${open ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                      {open ? "Open" : "Closed"}
                    </span>
                  </div>
                  <p className="font-bold text-sm text-gray-800 leading-tight">{d.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{d.college}</p>
                  <p className={`text-[10px] mt-0.5 font-semibold ${open ? "text-green-500" : "text-gray-400"}`}>{openLabel}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* ── STEP 2: Station picker ── */}
        {step === "station" && (
          <div className="flex flex-col gap-3 animate-fade-in">
            {cartCount > 0 && (
              <div className="bg-[#003087]/5 border border-[#003087]/20 rounded-2xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-[#003087]">{cartCount} item{cartCount > 1 ? "s" : ""} · ${cartTotal.toFixed(2)}</p>
                  <p className="text-xs text-gray-400">Tap to review your cart</p>
                </div>
                <button onClick={() => setStep("items")} className="text-xs font-bold text-white bg-[#003087] px-3 py-2 rounded-xl flex items-center gap-1 press">
                  Review <ChevronRight size={13}/>
                </button>
              </div>
            )}
            {menu.map((group, idx) => {
              const emojiMatch = group.category.match(/^\S+/);
              const emoji = emojiMatch ? emojiMatch[0] : "🍽";
              const stationName = group.category.replace(/^\S+\s*/, "");
              const stationCartCount = group.items.reduce((sum, item) => sum + (cart[item.name] ?? 0), 0);
              return (
                <button
                  key={idx}
                  onClick={() => { setStationIdx(idx); setStep("items"); }}
                  className={`flex items-center gap-4 bg-white rounded-2xl border-2 shadow-sm p-4 text-left hover:shadow-md transition lift press animate-slide-up ${stationCartCount > 0 ? "border-[#003087]/30 bg-[#003087]/2" : "border-gray-100"}`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl flex-shrink-0 border border-gray-100">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800">{stationName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{group.items.length} items</p>
                    {stationCartCount > 0 && (
                      <p className="text-xs font-bold text-[#003087] mt-1">{stationCartCount} added to cart</p>
                    )}
                  </div>
                  {stationCartCount > 0 ? (
                    <span className="w-6 h-6 rounded-full bg-[#003087] text-white text-xs font-black flex items-center justify-center flex-shrink-0 animate-pop-in">{stationCartCount}</span>
                  ) : (
                    <ChevronRight size={16} className="text-gray-300 flex-shrink-0"/>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ── STEP 3: Items + order form ── */}
        {step === "items" && currentStation && (
          <div className="flex flex-col gap-6 animate-fade-in">

            {/* Items for selected station */}
            <div>
              <Step n={3} label="Select what you ordered" />
              <div className="mt-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
                {currentStation.items.map((item) => {
                  const qty = cart[item.name] ?? 0;
                  return (
                    <div key={item.name} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {qty > 0 ? (
                          <>
                            <button onClick={() => sub(item.name)} className="w-7 h-7 rounded-full border-2 border-[#003087] flex items-center justify-center text-[#003087] hover:bg-[#003087] hover:text-white transition">
                              <Minus size={12}/>
                            </button>
                            <span className="w-5 text-center text-sm font-bold text-[#003087]">{qty}</span>
                            <button onClick={() => add(item.name)} className="w-7 h-7 rounded-full bg-[#003087] flex items-center justify-center text-white hover:bg-[#002060] transition">
                              <Plus size={12}/>
                            </button>
                          </>
                        ) : (
                          <button onClick={() => add(item.name)} className="w-7 h-7 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-[#003087] hover:text-[#003087] transition">
                            <Plus size={12}/>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => setStep("station")}
                className="mt-2.5 w-full flex items-center justify-center gap-2 text-sm font-semibold text-[#003087] bg-[#003087]/5 border border-[#003087]/15 rounded-2xl py-3 hover:bg-[#003087]/10 transition press"
              >
                <Plus size={14}/> Order from another station
              </button>
            </div>

            {/* Cart summary */}
            {cartCount > 0 && (
              <div className="bg-[#003087]/5 rounded-2xl p-4 border border-[#003087]/10 animate-scale-in">
                <p className="text-xs font-bold text-[#003087] uppercase tracking-wide mb-2">Your Cart</p>
                <div className="flex flex-col gap-1">
                  {Object.entries(cart).map(([name, qty]) => {
                    const price = allItems.find(i => i.name === name)?.price ?? 0;
                    return (
                      <div key={name} className="flex justify-between text-sm">
                        <span className="text-gray-600">{qty}× {name}</span>
                        <span className="font-semibold text-gray-800">${(price * qty).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-[#003087]/15 mt-2 pt-2 flex justify-between text-sm font-black text-[#003087]">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Triton2Go */}
            <section>
              <Step n={4} label="Confirm Triton2Go container" />
              <button
                onClick={() => setTriton(!triton)}
                className={`mt-3 w-full flex items-center gap-4 rounded-2xl border-2 px-4 py-4 transition ${triton ? "bg-green-50 border-green-400" : "bg-white border-gray-200 hover:border-gray-300"}`}
              >
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${triton ? "bg-green-500 border-green-500 scale-110" : "border-gray-300"}`}>
                  {triton && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-800">🥡 Yes, it&apos;s in a Triton2Go container</p>
                  <p className="text-xs text-gray-400 mt-0.5">Eco-friendly reusable container</p>
                </div>
              </button>
            </section>

            {/* Screenshot OCR */}
            <section>
              <Step n={5} label="Upload your Triton2Go confirmation" />
              <p className="text-xs text-gray-400 mt-1 mb-3">
                We&apos;ll automatically read your order details, student ID last 4, and pickup time from the screenshot.
              </p>
              {!file ? (
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full bg-white border-2 border-dashed border-gray-300 rounded-2xl py-10 flex flex-col items-center gap-2 hover:border-[#003087] hover:bg-[#003087]/3 transition"
                >
                  <div className="w-12 h-12 bg-[#003087]/10 rounded-full flex items-center justify-center">
                    <Upload size={22} className="text-[#003087]"/>
                  </div>
                  <p className="text-sm font-semibold text-gray-600">Tap to upload screenshot</p>
                  <p className="text-xs text-gray-400">JPG · PNG · HEIC</p>
                </button>
              ) : (
                <div className="rounded-2xl overflow-hidden border-2 border-gray-200 shadow-sm">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview!} alt="screenshot" className="w-full max-h-52 object-cover"/>
                    <button onClick={clearFile} className="absolute top-2 right-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition">
                      <X size={13}/>
                    </button>
                  </div>
                  {analyzing && (
                    <div className="px-4 py-4 bg-[#003087]/5 flex items-center gap-3">
                      <Loader2 size={18} className="text-[#003087] animate-spin flex-shrink-0"/>
                      <div>
                        <p className="text-sm font-bold text-[#003087]">Reading your screenshot…</p>
                        <p className="text-xs text-gray-400 mt-0.5">Extracting order details with AI</p>
                      </div>
                    </div>
                  )}
                  {extracted && !analyzing && (
                    <div className="px-4 py-4 bg-green-50 border-t-2 border-green-200 animate-slide-up">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle size={16} className="text-green-600 flex-shrink-0"/>
                        <p className="text-sm font-bold text-green-800">Screenshot read successfully</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Student ID (last 4)", value: extracted.pid_last4 },
                          { label: "Pickup Time",          value: extracted.pickup_time },
                          { label: "Order #",              value: extracted.order_number },
                          { label: "Dining Hall",          value: extracted.dining_hall },
                        ].map(({ label, value }) => value && (
                          <div key={label} className="bg-white rounded-xl px-3 py-2 border border-green-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
                            <p className="text-sm font-bold text-[#003087] mt-0.5">{value}</p>
                          </div>
                        ))}
                      </div>
                      {extracted.items && extracted.items.length > 0 && (
                        <div className="mt-2 bg-white rounded-xl px-3 py-2 border border-green-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Items from Screenshot</p>
                          {extracted.items.map((item: string, i: number) => (
                            <p key={i} className="text-xs text-gray-700">• {item}</p>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">This info will be sent to your Dasher automatically.</p>
                    </div>
                  )}
                  {ocrError && !analyzing && (
                    <div className="px-4 py-4 bg-amber-50 border-t border-amber-200">
                      <div className="flex items-start gap-2 mb-3">
                        <AlertCircle size={15} className="text-amber-500 flex-shrink-0 mt-0.5"/>
                        <div>
                          <p className="text-xs font-bold text-amber-800">Couldn&apos;t read automatically — enter details below</p>
                          {ocrErrorMsg ? (
                            <p className="text-xs text-amber-700 font-mono mt-0.5 break-all">{ocrErrorMsg}</p>
                          ) : (
                            <p className="text-xs text-amber-600 mt-0.5">Type in the info from your Triton2Go receipt.</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-amber-700 uppercase tracking-wide block mb-1">Receipt # last 4 digits</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="e.g. 8263"
                            value={manualLast4}
                            onChange={e => setManualLast4(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-amber-700 uppercase tracking-wide block mb-1">Order / Transaction #</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={20}
                            placeholder="e.g. 121358263"
                            value={manualOrderNum}
                            onChange={e => setManualOrderNum(e.target.value.trim())}
                            className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-amber-700 uppercase tracking-wide block mb-1">Pickup time (optional)</label>
                          <input
                            type="text"
                            maxLength={20}
                            placeholder="e.g. 1:02 PM"
                            value={manualPickupTime}
                            onChange={e => setManualPickupTime(e.target.value)}
                            className="w-full bg-white border border-amber-200 rounded-xl px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-300"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile}/>
            </section>

            {/* Delivery address */}
            <section>
              <div className="flex items-center justify-between">
                <Step n={6} label="Where should we deliver?" />
                <Link href="/profile" className="text-xs font-semibold text-[#003087] opacity-60 hover:opacity-100">Edit in profile</Link>
              </div>
              <div className="mt-3 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Building</label>
                    {building && <span className="text-[10px] text-[#003087]/60 font-semibold">From your profile</span>}
                  </div>
                  <select value={building} onChange={e => setBuilding(e.target.value)} className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] transition appearance-none">
                    <option value="" disabled>Select your building…</option>
                    {Object.entries(BUILDINGS_BY_COLLEGE).map(([college, buildings]) => (
                      <optgroup key={college} label={college}>
                        {buildings.map(b => <option key={b} value={b}>{b}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Room Number</label>
                  <input
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] transition"
                    placeholder="e.g. 214B"
                    value={room}
                    onChange={e => setRoom(e.target.value)}
                  />
                </div>
                <button onClick={() => setToDoor(!toDoor)} className={`flex items-center gap-4 rounded-2xl border-2 px-4 py-4 transition text-left ${toDoor ? "bg-[#003087]/5 border-[#003087]" : "bg-white border-gray-200 hover:border-gray-300"}`}>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${toDoor ? "bg-[#003087] border-[#003087] scale-110" : "border-gray-300"}`}>
                    {toDoor && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">🚪 Deliver to my room door <span className="text-[#003087]">+$2.00</span></p>
                    <p className="text-xs text-gray-400 mt-0.5">Dasher will bring it directly to your door</p>
                  </div>
                </button>
              </div>
            </section>

            {/* Schedule */}
            <section>
              <Step n={7} label="When do you want delivery?" />
              <div className="mt-3 flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setScheduleMode(false)} className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-bold transition ${!scheduleMode ? "border-[#003087] bg-[#003087]/5 text-[#003087]" : "border-gray-200 bg-white text-gray-500"}`}>⚡ ASAP</button>
                  <button onClick={() => setScheduleMode(true)} className={`flex items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-bold transition ${scheduleMode ? "border-[#F5B700] bg-[#F5B700]/10 text-[#003087]" : "border-gray-200 bg-white text-gray-500"}`}><Clock size={15}/> Schedule</button>
                </div>
                {scheduleMode && (
                  <div className="animate-fade-in flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivery Time</label>
                    <input type="datetime-local" className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#003087]/20 focus:border-[#003087] transition" value={scheduledFor} onChange={e => setScheduledFor(e.target.value)} min={new Date(Date.now() + 15 * 60 * 1000).toISOString().slice(0, 16)}/>
                    {scheduledFor && <p className="text-xs text-[#003087] font-semibold">Order will appear to Dashers at the scheduled time</p>}
                  </div>
                )}
              </div>
            </section>

          </div>
        )}

      </main>

      {/* ── CTA: submit (step 3 only) ── */}
      {step === "items" && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#F8FAFC]/95 backdrop-blur border-t border-gray-100">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => { if (canSubmit && !submitting) saveAndGo(); }}
              disabled={!canSubmit || analyzing || submitting}
              className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl shadow-lg transition text-base ${canSubmit && !submitting ? "bg-[#F5B700] text-[#003087] hover:bg-[#e0a800] active:scale-[0.98]" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
            >
              {submitting ? <><Loader2 size={18} className="animate-spin"/> Placing order…</> :
               analyzing  ? <><Loader2 size={18} className="animate-spin"/> Analyzing…</> :
               <>Submit Order <ChevronRight size={18}/></>}
            </button>
            {!canSubmit && !analyzing && (
              <p className="text-center text-xs text-gray-400 mt-2">
                {cartCount === 0 ? "Add at least one item" : !triton ? "Confirm Triton2Go container" : !building ? "Select your building" : "Almost there!"}
              </p>
            )}
            {apiError && (
              <div className="mt-2 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0"/>
                <p className="text-xs text-red-700 font-semibold">{apiError}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CTA: view cart (step 2 only, when cart non-empty) ── */}
      {step === "station" && cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#F8FAFC]/95 backdrop-blur border-t border-gray-100">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => setStep("items")}
              className="w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl shadow-lg bg-[#003087] text-white hover:bg-[#002060] transition press"
            >
              View cart ({cartCount} item{cartCount > 1 ? "s" : ""}) · ${cartTotal.toFixed(2)} <ChevronRight size={18}/>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function OrderPage() {
  return <Suspense><OrderPageInner /></Suspense>;
}

function Step({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 bg-[#003087] text-white rounded-full flex items-center justify-center text-xs font-black flex-shrink-0">{n}</div>
      <p className="font-bold text-gray-800">{label}</p>
    </div>
  );
}

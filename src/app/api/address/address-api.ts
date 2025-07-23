import { NextResponse } from "next/server";

const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get("type"); // provinces, districts, wards
  const parent = url.searchParams.get("parent"); // parent name for districts or wards

  try {
    let query = "";
    if (type === "provinces") {
      query = `
        [out:json];
        area["ISO3166-2"="VN"];
        relation(area)["admin_level"="4"];
        out tags;
      `;
    } else if (type === "districts") {
      query = `
        [out:json];
        area["name"="${parent}"]["admin_level"="4"];
        relation(area)["admin_level"="6"];
        out tags;
      `;
    } else if (type === "wards") {
      query = `
        [out:json];
        area["name"="${parent}"]["admin_level"="6"];
        relation(area)["admin_level"="8"];
        out tags;
      `;
    } else {
      return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    }

    const response = await fetch(OVERPASS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from Overpass API");
    }

    const data = await response.json();
    const results = data.elements.map((element: any) => element.tags.name);
    
    return NextResponse.json({ [type]: results });
  } catch (error) {
    console.error("Error fetching address data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
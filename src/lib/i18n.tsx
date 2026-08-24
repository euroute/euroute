import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "sv" | "en";

const STORAGE_KEY = "euroute-lang";

type Dict = Record<string, string>;

const sv: Dict = {
  "brand.tagline": "tågresor i Europa",
  "nav.search": "Sök resa",
  "nav.myTrips": "Mina resor",
  "nav.signOut": "Logga ut",
  "nav.signIn": "Logga in",
  "lang.label": "Språk",

  "form.from": "Från",
  "form.fromPlaceholder": "t.ex. Stockholm Centralstation",
  "form.to": "Till",
  "form.toPlaceholder": "t.ex. Berlin Hbf",
  "form.viaPlaceholder": "t.ex. Hamburg Hbf",
  "form.viaLabel": "Byte",
  "form.removeVia": "Ta bort mellanstopp",
  "form.date": "Avresedag",
  "form.time": "Tidigast avgång",
  "form.maxTransfers": "Max byten",
  "form.direct": "Direkttåg",
  "form.transfersN": "{n} byten",
  "form.minTransfer": "Minsta bytesmarginal",
  "form.minutesN": "{n} min",
  "form.submit": "Hitta tågresor",
  "form.addVia": "Lägg till mellanstopp",
  "form.viaHint": "Vet du var du vill byta? Lägg till stopp – vi kedjar etapperna åt dig.",
  "form.missingStations": "Välj både startstation och slutstation i listan.",

  "home.h1": "Hela tågresan genom Europa – i en enda sökning.",
  "home.lead":
    "Slipp hoppa mellan SJ, DSB och DB. Fyll i var du ska, lägg till byten du vill göra, och få en tydlig överblick över dina alternativ med länkar till varje biljett.",
  "home.featuresTitle": "Byggd för långa tågresor",
  "home.f1.title": "Alla bolag i en sökning",
  "home.f1.text":
    "Vi kombinerar tidtabeller över hela Europa, oavsett om etappen körs av SJ, DSB, DB eller ÖBB.",
  "home.f2.title": "Egna mellanstopp",
  "home.f2.text":
    "Vet du att du vill byta i Hamburg eller København? Lägg till stoppet – vi kedjar etapperna.",
  "home.f3.title": "Smart rangordning",
  "home.f3.text": "Berätta hur du vill resa – vi rangordnar förslagen och varnar för korta byten.",
  "home.f4.title": "Boka etapp för etapp",
  "home.f4.text": "Varje etapp får en direktlänk till rätt bolag, så du slipper leta själv.",
  "home.saveTitle": "Spara dina reseplaner",
  "home.saveText":
    "Med ett konto sparar du hela reseplanen med alla etapper – och kan dela den med resekompisen via länk.",
  "home.createAccount": "Skapa konto",
  "footer.note":
    "Tidtabellsdata från öppna europeiska datakällor via Transitous. Kontrollera alltid tider och villkor hos tågbolaget innan du bokar.",
  "footer.sourcesPrefix": "Tidtabellsdata från öppna europeiska datakällor via ",
  "footer.sourcesLink": "Transitous (datakällor)",
  "footer.sourcesSuffix": ". Kontrollera alltid tider och villkor hos tågbolaget innan du bokar.",
  "footer.osmPrefix": "Stations- och platssökning bygger på data från ",
  "footer.osmLink": "© OpenStreetMap-bidragsgivare",
  "footer.osmSuffix": ".",

  "search.incompleteTitle": "Ofullständig sökning",
  "search.incompleteText": "Fyll i start, mål och avresetid för att se reseförslag.",
  "search.toSearch": "Till sökningen",
  "search.newSearch": "Ny sökning",
  "search.summary": "{day} · max {max} byten · minst {min} min bytesmarginal",
  "search.summaryAny": "{day} · valfritt antal byten · minst {min} min bytesmarginal",
  "search.via": " · via {list}",
  "search.loading": "Söker tidtabeller i hela Europa …",
  "search.failedTitle": "Sökningen gick inte igenom",
  "search.emptyTitle": "Inga resor hittades",
  "search.emptyText":
    "Prova en större station i närheten, ett annat datum eller fler tillåtna byten.",
  "search.saveTrip": "Spara reseplan",
  "search.signInToSave": "för att spara den här reseplanen.",
  "search.editSearch": "Ändra sökningen",
  "search.saved": "Resan är sparad under Mina resor.",
  "search.saveFailed": "Kunde inte spara resan.",

  "journey.direct": "Direkt",
  "journey.transfersN": "{n} byten",
  "journey.night": "Nattåg",
  "journey.tightTransfer": "Kort bytesmarginal: {min} min i {station}.",
  "journey.transferAt": "Byte i {station} · {min} min",
  "journey.towards": "mot {headsign}",
  "journey.bookLeg": "Se tider & boka etappen",
  "journey.bookWith": "Boka hos {operator}",
  "journey.operatorFallback": "operatören",

  "auth.h1": "Ditt resekonto",
  "auth.lead": "Spara reseplaner med alla etapper och bokningslänkar.",
  "auth.google": "Fortsätt med Google",
  "auth.orEmail": "eller e-post",
  "auth.signIn": "Logga in",
  "auth.signUp": "Skapa konto",
  "auth.email": "E-post",
  "auth.password": "Lösenord",
  "auth.name": "Namn",
  "auth.invalidEmail": "Ange en giltig e-postadress.",
  "auth.shortPassword": "Lösenordet måste vara minst 8 tecken.",
  "auth.checkFields": "Kontrollera uppgifterna.",
  "auth.wrongCredentials": "Fel e-post eller lösenord.",
  "auth.emailTaken": "E-postadressen har redan ett konto.",
  "auth.signUpFailed": "Kunde inte skapa kontot.",
  "auth.confirmEmail": "Kolla din e-post och bekräfta adressen för att logga in.",
  "auth.googleFailed": "Google-inloggningen misslyckades.",

  "trips.h1": "Mina resor",
  "trips.lead": "Sparade reseplaner med alla delar av resan och var de kan bokas.",
  "trips.loading": "Hämtar dina resor …",
  "trips.emptyTitle": "Inga sparade resor än",
  "trips.emptyText": "Sök en resa och tryck på “Spara reseplan”.",
  "trips.searchCta": "Sök tågresa",
  "trips.noDate": "Utan datum",
  "trips.delete": "Ta bort",
  "trips.deleted": "Resan är borttagen.",
  "trips.deleteFailed": "Kunde inte ta bort resan.",
  "trips.upcoming": "Kommande resor",
  "trips.past": "Tidigare resor",
  "trips.open": "Öppna reseplan",
  "trips.bookedN": "{n} delar markerade som bokade",
  "trips.booked1": "1 del markerad som bokad",
  "trips.confirmDelete": "Ta bort den här reseplanen? Bokningsmarkeringar och anteckningar tas bort med den.",
  "trips.alreadySaved": "Resan är redan sparad under Mina resor.",
  "trips.shared": "Delad",

  "save.savedShort": "Sparad",
  "save.viewTrip": "Visa reseplan",
  "save.signInToSave": "Logga in – vi sparar reseplanen så snart du är inne.",
  "save.autoSaved": "Reseplanen är sparad under Mina resor.",

  "book.title": "Boka dina tåg",
  "book.lead":
    "Euroute visar var de olika delarna av resan kan bokas. Flera tåg kan ibland bokas tillsammans hos samma tågbolag. Kontrollera den slutliga resan, priset och biljettvillkoren hos bokningssidan innan du köper.",
  "book.progress": "{done} av {total} delar markerade som bokade",
  "book.allMarked": "Alla delar markerade som bokade",
  "book.dayHeading": "Dag {n} · {date}",
  "book.legsInside": "{n} tåg i samma bokning",
  "book.markBooked": "Markera som bokad",
  "book.bookedMark": "Markerad som bokad",
  "book.markFailed": "Kunde inte uppdatera bokningsstatus.",
  "book.openTimes": "Se tider & boka",
  "book.atOperator": "Boka hos {operator}",
  "book.nightIn": "Natt i {city} · ankomst {arr}, vidare {dep}",
  "book.disclaimer":
    "Euroute säljer inga biljetter. Bokning sker hos respektive tågbolag eller bokningspartner. Kontrollera tider, priser och villkor innan köp.",

  "trip.loading": "Hämtar reseplanen …",
  "trip.back": "Mina resor",
  "trip.notFoundTitle": "Reseplanen finns inte",
  "trip.notFoundText": "Den kan ha tagits bort, eller så tillhör den ett annat konto.",
  "trip.itinerary": "Reseplan dag för dag",
  "trip.changesN": "{n} byten",
  "trip.daysN": "{n} resdagar",
  "trip.nightsN": "{n} övernattningar",
  "trip.nights1": "1 övernattning",
  "trip.trainTime": "Restid resdagarna: {duration}",
  "trip.shareOn": "Dela med länk",
  "trip.shareOff": "Sluta dela",
  "trip.shareFailed": "Kunde inte ändra delningen.",
  "trip.copyLink": "Kopiera länk",
  "trip.linkCopied": "Länken är kopierad.",
  "trip.notes": "Egna anteckningar",
  "trip.notesPlaceholder": "T.ex. bokningsnummer, hotell eller platsbokning.",
  "trip.saveNotes": "Spara anteckningar",
  "trip.notesSaved": "Anteckningarna är sparade.",
  "trip.notesFailed": "Kunde inte spara anteckningarna.",
  "trip.legacyTitle": "Sparad före reseplanerna",
  "trip.legacyText":
    "Den här resan sparades i ett äldre format. Gör en ny sökning och spara den igen för att få bokningslistan.",

  "shared.badge": "Delad reseplan",
  "shared.missingTitle": "Reseplanen är inte delad",
  "shared.missingText": "Länken kan ha slutat gälla eller så har delningen stängts av.",
  "shared.ctaTitle": "Planera din egen tågresa",
  "shared.ctaText": "Sök tågresor genom hela Europa och spara din egen reseplan.",

  "style.title": "Hur vill du resa?",
  "style.recommended": "Rekommenderad",
  "style.recommended.desc": "Bästa balans mellan restid, byten och enkelhet.",
  "style.fastest": "Snabbast",
  "style.fastest.desc": "Kortast total restid.",
  "style.comfortable": "Bekväm",
  "style.comfortable.desc": "Färre byten och tryggare bytesmarginaler.",
  "style.scenic": "Naturskön",
  "style.scenic.desc": "Längre rutter med vackrare järnväg.",
  "style.cheapest": "Billigast",
  "style.cheapest.desc": "Lägst uppskattat biljettpris.",
  "style.unavailable": "Inte tillgänglig – vi har ingen tillförlitlig data för det här ännu.",

  "prefs.title": "Reseinställningar",
  "prefs.minTransfer": "Minsta bytesmarginal",
  "prefs.maxTransfers": "Max antal byten",
  "prefs.any": "Valfritt",
  "prefs.avoidNightTrains": "Undvik nattåg",
  "prefs.avoidOvernight": "Undvik att resa över natten",
  "prefs.avoidStationChange": "Undvik stationsbyten inom en stad",
  "prefs.preferDirect": "Föredra direkttåg",
  "prefs.preferHighSpeed": "Föredra snabbtåg",
  "prefs.avoidBuses": "Undvik bussar och ersättningsbussar",
  "prefs.maxPerDay": "Max restid per dag",
  "prefs.noLimit": "Ingen gräns",
  "prefs.hoursN": "{n} h",
  "prefs.saved": "Dina inställningar är sparade.",

  "score.label": "Euroute Score",
  "score.why": "Så räknas poängen",
  "score.time": "Restid",
  "score.changes": "Byten",
  "score.connections": "Bytesmarginaler",
  "score.simplicity": "Enkelhet",
  "score.dayComfort": "Restid på dygnet",
  "score.preferenceFit": "Dina inställningar",
  "score.note":
    "Poängen jämför resorna i den här sökningen med varandra – den är inte ett allmänt mått på reskvalitet.",

  "score.extreme": "Extra lång resa",
  "reason.direct": "Direkttåg hela vägen – inga byten att missa.",
  "reason.fastestAndSafe": "Kortast restid i den här sökningen och gott om tid vid varje byte.",
  "reason.balanced": "Bästa kombinationen av restid, byten och bekväma anslutningar.",
  "reason.fewChangesSafe": "Bara {n} byten och gott om tid vid varje byte.",
  "reason.safeConnections": "Gott om tid vid varje byte, med rimlig restid.",
  "reason.fastest": "Kortast restid i den här sökningen.",
  "reason.bestAvailable":
    "Bästa tillgängliga resan för den här sökningen – observera anmärkningarna nedan.",
  "cat.fewerChanges": "Färre byten",
  "cat.saferConnections": "Tryggare byten",
  "cat.laterDeparture": "Senare avgång",
  "cat.earlierArrival": "Tidigare framme",
  "cat.alsoFastest": "Även snabbast",
  "hl.muchLonger": "{time} längre än snabbaste resan",
  "cat.recommended": "Rekommenderad",
  "cat.fastest": "Snabbast",
  "cat.comfortable": "Bekväm",

  "conn.comfortable": "Gott om tid för bytet",
  "conn.tight": "Kort tid för bytet",
  "conn.risky": "Mycket kort tid – risk att missa tåget",
  "conn.minutes": "{min} min byte",
  "conn.longWait": "Lång väntetid ({time})",
  "conn.recommend": "Vi rekommenderar minst {min} minuter för det här bytet.",
  "conn.stationChange": "Byte av station inom staden",

  "option.view": "Visa resan",
  "option.hide": "Dölj detaljer",
  "option.showMore": "Visa fler resor",
  "option.showLess": "Dölj fler resor",
  "option.moreCount": "{n} fler resor",

  "hl.direct": "Direkttåg utan byten",
  "hl.fewChanges": "Bara {n} byten",
  "hl.comfortableConnections": "Bekväma byten",
  "hl.tightAt": "Kort byte i {station} ({min} min)",
  "hl.riskyAt": "Riskabelt byte i {station} ({min} min)",
  "hl.longWaitAt": "Lång väntetid i {station} ({time})",
  "hl.stationChange1": "Ett stationsbyte inom staden",
  "hl.stationChanges": "{n} stationsbyten inom staden",
  "hl.noStationChange": "Inga stationsbyten",
  "hl.hasBus": "Innehåller buss",
  "hl.nightTrain": "Nattåg – du sover under resan",
  "hl.overnight": "Resan pågår över natten",
  "hl.dayTrains": "Dagtåg",
  "hl.matchesPreferences": "Matchar dina inställningar",

  "data.priceUnavailable": "Prisdata saknas i tidtabellskällan.",
  "data.scenicUnavailable": "Vi har ingen tillförlitlig data om naturskön järnväg ännu.",

  "prefs.allowOvernightStop": "Föreslå övernattning på vägen",

  "on.loading": "Vi kontrollerar om resan blir bättre med en övernattning …",
  "on.title": "Ett bekvämare sätt att resa",
  "on.split": "Dela resan i {city}",
  "on.view": "Visa övernattningsresan",
  "on.hide": "Dölj övernattningsresan",
  "on.continue": "Fortsätt utan övernattning",
  "on.day": "Dag {n}",
  "on.stay": "Övernatta i {city}",
  "on.stayArrival": "Ankomst {time}",
  "on.stayNext": "Nästa tåg {time}",
  "on.stayWait": "{time} i {city}",
  "on.nights": "{n} nätter",
  "on.summary": "{days} resdagar · längsta resdag {longest} · {changes} byten",
  "on.added": "{time} längre restid på tåg än att resa utan uppehåll",
  "on.addedNone": "Ingen extra tid på tåg jämfört med att resa utan uppehåll",
  "on.benefitsTitle": "Det här vinner du",
  "on.others": "Andra övernattningsalternativ",
  "on.otherOption": "Övernatta i {city}",
  "on.chooseTitle": "Jag vill övernatta i:",
  "on.chooseHint": "Vi bygger resan runt ditt stopp med riktiga tidtabeller.",
  "on.chooseSubmit": "Planera med det här stoppet",
  "on.chooseClear": "Rensa stoppet",
  "on.unavailable": "Vi hittade ingen resa som fungerar för en övernattning i {city}.",
  "on.limitMissed": "Vi hittade ingen resa där alla resdagar håller sig under {h} timmar.",
  "on.limitClosest": "Närmaste alternativ: längsta resdagen är {time}.",
  "on.noneFound":
    "Vi hittade ingen övernattning som gör den här resan tydligt bättre. Den sammanhängande resan är fortfarande ditt bästa alternativ.",

  "on.benefit.noNightTravel": "Ingen resa genom natten",
  "on.benefit.balancedDays": "Jämna resdagar ({d1} och {d2})",
  "on.benefit.shorterDays": "Längsta resdag {time}",
  "on.benefit.comfortableConnections": "Gott om tid för byten",
  "on.benefit.noStationChange": "Inga stationsbyten",
  "on.benefit.withinLimit": "Alla resdagar under {h} timmar",
  "on.benefit.eveningArrival": "Framme på kvällen med tid att checka in och äta",

  "on.reason.withinLimit":
    "En natt i {city} håller alla resdagar under {h} timmar – längsta resdagen blir {time}.",
  "on.reason.noNightBalanced":
    "{city} delar resan i två jämna resdagar ({d1} och {d2}) och du slipper resa genom natten.",
  "on.reason.noNight": "Genom att övernatta i {city} slipper du resa genom natten.",
  "on.reason.saferConnections":
    "En natt i {city} tar bort {n} pressade byten och ger bättre marginaler.",
  "on.reason.balanced": "{city} delar resan i två hanterbara resdagar ({d1} och {d2}).",
  "on.reason.shorterDays": "Med stopp i {city} blir längsta resdagen {time}.",

  "on.badgeAlt": "Dela resan på vägen",
  "on.headingAlt": "Resan kan delas i {city}",
  "on.showDetails": "Visa detaljer",
  "on.hideDetails": "Dölj detaljer",
  "on.dayHeading": "Dag {n}",
  "on.dayRoute": "{from} → {to}",
  "on.dayTimes": "{dep} → {arr}",
  "on.nightIn": "Övernattning i {city}",
  "on.nightArrival": "Ankomst {time}",
  "on.nightDeparture": "Nästa dags avgång {time}",
  "on.betweenTrains": "{time} mellan tågen",
  "on.whyCity": "Varför {city}?",
  "on.trainTime": "{time} på tåg",

  "on.benefit.rest.veryGood": "Gott om tid för kväll och natt före nästa resdag",
  "on.benefit.rest.good": "Rimlig övernattning innan nästa resdag",
  "on.benefit.manageableDays": "Hanterbara resdagar (längst {time})",

  "on.warn.longDay": "Lång resdag {n} ({time})",
  "on.warn.extremeDay": "Mycket lång resdag {n} ({time})",
  "on.warn.riskyConnection": "Kort byte i {city} ({min} min)",
  "on.warn.tightConnection": "Pressat byte i {city} ({min} min)",
  "on.warn.rest.short": "Kort övernattning ({arrival}–{departure})",
  "on.warn.rest.poor": "Lite tid för vila ({arrival}–{departure})",
  "on.warn.stillNightTravel": "Resan går fortfarande delvis genom natten",
  "on.warn.addedTime": "{time} längre restid än utan uppehåll",
  "on.warn.stationChange": "{n} stationsbyten",
  "on.warn.overLimit": "Längsta resdagen är {time}, över din gräns på {h} timmar",

  "on.tradeoff.longDay": "Du får en lång resdag {n} ({time}).",
  "on.tradeoff.nightVsLongDay":
    "Du slipper resa genom natten, men får en lång resdag {n} ({time}).",
  "on.tradeoff.risky": "Resan innehåller fortfarande ett kort byte.",
  "on.tradeoff.rest": "Övernattningen ger begränsad tid för vila.",
  "on.tradeoff.overLimit": "Längsta resdagen blir {time}, över din gräns på {h} timmar.",
  "on.tradeoff.addedTime": "Uppdelningen kostar {time} extra restid.",

  "on.reason.bestOfCompared":
    "{city} ger den bästa helheten av de {n} övernattningsstopp vi jämförde – resdagarnas längd, nattvila och vidareförbindelser vägda samman.",

  "nav.account": "Konto",
  "footer.noTickets":
    "Euroute säljer inga biljetter och ser varken platstillgång eller priser. Varje etapp bokas hos tågbolaget eller en bokningspartner.",
  "footer.privacy": "Integritet",

  "privacy.h1": "Integritet och personuppgifter",
  "privacy.lead":
    "Euroute är ett planeringsverktyg för tågresor i Europa. Vi sparar så lite som möjligt – bara det som behövs för sökningen, dina sparade reseplaner och för att tjänsten ska fungera.",
  "privacy.data.title": "Vad vi sparar",
  "privacy.data.text":
    "Utan konto: inget om dig sparas. Sökningen skickas till tidtabellstjänsten för att ge resultat, och kopplas inte till någon användare.\n\nMed konto: din e-postadress (via inloggningstjänsten), dina sparade reseplaner med resans innehåll, dina egna anteckningar, dina resepreferenser och vilka delar av resan du markerat som bokade.\n\nNär någon öppnar en bokningslänk sparar vi en teknisk händelse – vilken etapp, vilket bolag och en envägshash av nätverksuppgifter – för att se vilka länkar som används. Hashen kan inte översättas tillbaka till en IP-adress.",
  "privacy.why.title": "Varför",
  "privacy.why.text":
    "Kontouppgifter finns för att du ska kunna komma tillbaka till dina reseplaner från vilken enhet som helst. Bokningshändelser finns för att vi ska se vilka bokningslänkar som faktiskt fungerar. Vi använder inte dina uppgifter för annonser, profilering eller försäljning, och delar dem inte med tågbolagen.",
  "privacy.keep.title": "Hur länge",
  "privacy.keep.text":
    "Sparade reseplaner, anteckningar, bokningsmarkeringar och preferenser sparas tills du raderar dem eller raderar kontot. Bokningshändelser sparas avidentifierade som samlad statistik.",
  "privacy.third.title": "Tjänster vi använder",
  "privacy.third.text":
    "Tidtabellsdata kommer från öppna europeiska datakällor via Transitous. Sökuppgifter (ortnamn, datum och tid) skickas dit för att ge resultat.\n\nKonto, databas och drift körs hos vår infrastrukturleverantör inom EU.\n\nBokningslänkar leder till tågbolagens och bokningspartnernas egna sidor, där deras villkor och integritetspolicy gäller.",
  "privacy.rights.title": "Dina rättigheter",
  "privacy.rights.text":
    "Du kan exportera alla dina uppgifter som en fil och radera kontot med allt innehåll under Konto. Raderingen sker direkt och kan inte ångras. Du kan också begära rättelse av dina uppgifter eller invända mot hur de används.",
  "privacy.cookies.title": "Kakor",
  "privacy.cookies.text":
    "Vi använder inga annons- eller analyskakor. Webbläsaren sparar din inloggningssession och ditt språkval – inget annat.",
  "privacy.contact.title": "Kontakt",
  "privacy.contact.text":
    "För frågor om dina personuppgifter, eller för att använda dina rättigheter, kontakta den ansvariga för Euroute: [lägg in din kontaktadress].",

  "account.h1": "Mitt konto",
  "account.lead": "Dina inloggningsuppgifter, en kopia av dina uppgifter och permanent radering.",
  "account.detailsTitle": "Inloggning",
  "account.email": "E-post",
  "account.exportTitle": "Ladda ner dina uppgifter",
  "account.exportText":
    "Du får en fil med dina sparade reseplaner, bokningsmarkeringar och resepreferenser.",
  "account.exportCta": "Ladda ner fil",
  "account.exportFailed": "Kunde inte skapa filen. Försök igen.",
  "account.deleteTitle": "Radera konto",
  "account.deleteText":
    "Detta raderar ditt konto, alla sparade reseplaner, anteckningar, bokningsmarkeringar och preferenser. Statistik över bokningsklick sparas avidentifierad, utan koppling till dig. Raderingen går inte att ångra.",
  "account.confirmWord": "RADERA",
  "account.confirmLabel": "Skriv {word} för att bekräfta",
  "account.deleteCta": "Radera mitt konto permanent",
  "account.deleted": "Ditt konto och alla dina uppgifter är raderade.",
  "account.deleteFailed": "Kunde inte radera kontot. Försök igen.",
};

const en: Dict = {
  "brand.tagline": "train travel across Europe",
  "nav.search": "Search trip",
  "nav.myTrips": "My trips",
  "nav.signOut": "Sign out",
  "nav.signIn": "Sign in",
  "lang.label": "Language",

  "form.from": "From",
  "form.fromPlaceholder": "e.g. Stockholm Central Station",
  "form.to": "To",
  "form.toPlaceholder": "e.g. Berlin Hbf",
  "form.viaPlaceholder": "e.g. Hamburg Hbf",
  "form.viaLabel": "Change",
  "form.removeVia": "Remove stopover",
  "form.date": "Departure date",
  "form.time": "Earliest departure",
  "form.maxTransfers": "Max changes",
  "form.direct": "Direct trains",
  "form.transfersN": "{n} changes",
  "form.minTransfer": "Minimum connection time",
  "form.minutesN": "{n} min",
  "form.submit": "Find train trips",
  "form.addVia": "Add stopover",
  "form.viaHint": "Know where you want to change? Add a stop – we chain the legs for you.",
  "form.missingStations": "Pick both an origin and a destination from the list.",

  "home.h1": "Your whole European train journey – in a single search.",
  "home.lead":
    "No more hopping between SJ, DSB and DB. Enter where you're going, add the changes you want, and get a clear overview of your options with a link for every ticket.",
  "home.featuresTitle": "Built for long train journeys",
  "home.f1.title": "Every operator in one search",
  "home.f1.text":
    "We combine timetables across Europe, whether the leg is run by SJ, DSB, DB or ÖBB.",
  "home.f2.title": "Your own stopovers",
  "home.f2.text":
    "Know you want to change in Hamburg or Copenhagen? Add the stop – we chain the legs together.",
  "home.f3.title": "Smart ranking",
  "home.f3.text":
    "Tell us how you like to travel – we rank the options and flag tight connections.",
  "home.f4.title": "Book leg by leg",
  "home.f4.text": "Every leg gets a direct link to the right operator, so you don't have to hunt.",
  "home.saveTitle": "Save your travel plans",
  "home.saveText":
    "With an account you can save the full plan with every leg – and share it with your travel companion via a link.",
  "home.createAccount": "Create account",
  "footer.note":
    "Timetable data from open European sources via Transitous. Always double-check times and conditions with the operator before booking.",
  "footer.sourcesPrefix": "Timetable data from open European data sources via ",
  "footer.sourcesLink": "Transitous (data sources)",
  "footer.sourcesSuffix": ". Always double-check times and conditions with the operator before booking.",
  "footer.osmPrefix": "Station and place search uses data from ",
  "footer.osmLink": "© OpenStreetMap contributors",
  "footer.osmSuffix": ".",

  "search.incompleteTitle": "Incomplete search",
  "search.incompleteText": "Enter origin, destination and departure time to see suggestions.",
  "search.toSearch": "Go to search",
  "search.newSearch": "New search",
  "search.summary": "{day} · max {max} changes · at least {min} min connection time",
  "search.summaryAny": "{day} · any number of changes · at least {min} min connection time",
  "search.via": " · via {list}",
  "search.loading": "Searching timetables across Europe …",
  "search.failedTitle": "The search didn't go through",
  "search.emptyTitle": "No trips found",
  "search.emptyText": "Try a larger nearby station, another date, or allow more changes.",
  "search.saveTrip": "Save travel plan",
  "search.signInToSave": "to save this travel plan.",
  "search.editSearch": "Edit search",
  "search.saved": "The trip is saved under My trips.",
  "search.saveFailed": "Couldn't save the trip.",

  "journey.direct": "Direct",
  "journey.transfersN": "{n} changes",
  "journey.night": "Night train",
  "journey.tightTransfer": "Tight connection: {min} min in {station}.",
  "journey.transferAt": "Change in {station} · {min} min",
  "journey.towards": "towards {headsign}",
  "journey.bookLeg": "See times & book this leg",
  "journey.bookWith": "Book with {operator}",
  "journey.operatorFallback": "the operator",

  "auth.h1": "Your travel account",
  "auth.lead": "Save travel plans with every leg and booking links.",
  "auth.google": "Continue with Google",
  "auth.orEmail": "or email",
  "auth.signIn": "Sign in",
  "auth.signUp": "Create account",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.name": "Name",
  "auth.invalidEmail": "Enter a valid email address.",
  "auth.shortPassword": "The password must be at least 8 characters.",
  "auth.checkFields": "Please check your details.",
  "auth.wrongCredentials": "Wrong email or password.",
  "auth.emailTaken": "That email already has an account.",
  "auth.signUpFailed": "Couldn't create the account.",
  "auth.confirmEmail": "Check your inbox and confirm your address to sign in.",
  "auth.googleFailed": "Google sign-in failed.",

  "trips.h1": "My trips",
  "trips.lead": "Saved travel plans with every part of the journey and where to book it.",
  "trips.loading": "Loading your trips …",
  "trips.emptyTitle": "No saved trips yet",
  "trips.emptyText": "Search for a trip and press “Save travel plan”.",
  "trips.searchCta": "Search trains",
  "trips.noDate": "No date",
  "trips.delete": "Delete",
  "trips.deleted": "The trip was deleted.",
  "trips.deleteFailed": "Couldn't delete the trip.",
  "trips.upcoming": "Upcoming trips",
  "trips.past": "Past trips",
  "trips.open": "Open travel plan",
  "trips.bookedN": "{n} parts marked as booked",
  "trips.booked1": "1 part marked as booked",
  "trips.confirmDelete": "Delete this travel plan? Booking marks and notes are removed with it.",
  "trips.alreadySaved": "This trip is already saved under My trips.",
  "trips.shared": "Shared",

  "save.savedShort": "Saved",
  "save.viewTrip": "View travel plan",
  "save.signInToSave": "Sign in – we'll save the travel plan as soon as you're in.",
  "save.autoSaved": "The travel plan is saved under My trips.",

  "book.title": "Book your trains",
  "book.lead":
    "Euroute shows where each part of the journey can be booked. Several trains can sometimes be booked together with the same operator. Check the final journey, price and ticket conditions on the booking site before you buy.",
  "book.progress": "{done} of {total} parts marked as booked",
  "book.allMarked": "All parts marked as booked",
  "book.dayHeading": "Day {n} · {date}",
  "book.legsInside": "{n} trains in the same booking",
  "book.markBooked": "Mark as booked",
  "book.bookedMark": "Marked as booked",
  "book.markFailed": "Couldn't update the booking status.",
  "book.openTimes": "See times & book",
  "book.atOperator": "Book with {operator}",
  "book.nightIn": "Night in {city} · arrive {arr}, continue {dep}",
  "book.disclaimer":
    "Euroute doesn't sell tickets. Booking happens with each operator or booking partner. Check times, prices and conditions before you buy.",

  "trip.loading": "Loading the travel plan …",
  "trip.back": "My trips",
  "trip.notFoundTitle": "Travel plan not found",
  "trip.notFoundText": "It may have been deleted, or it belongs to another account.",
  "trip.itinerary": "Day-by-day itinerary",
  "trip.changesN": "{n} changes",
  "trip.daysN": "{n} travel days",
  "trip.nightsN": "{n} overnight stops",
  "trip.nights1": "1 overnight stop",
  "trip.trainTime": "Travel time across the travel days: {duration}",
  "trip.shareOn": "Share with a link",
  "trip.shareOff": "Stop sharing",
  "trip.shareFailed": "Couldn't change sharing.",
  "trip.copyLink": "Copy link",
  "trip.linkCopied": "Link copied.",
  "trip.notes": "Your notes",
  "trip.notesPlaceholder": "E.g. booking references, hotel or seat reservation.",
  "trip.saveNotes": "Save notes",
  "trip.notesSaved": "Notes saved.",
  "trip.notesFailed": "Couldn't save the notes.",
  "trip.legacyTitle": "Saved before travel plans",
  "trip.legacyText":
    "This trip was saved in an older format. Search again and re-save it to get the booking list.",

  "shared.badge": "Shared travel plan",
  "shared.missingTitle": "This travel plan isn't shared",
  "shared.missingText": "The link may have expired, or sharing was turned off.",
  "shared.ctaTitle": "Plan your own train trip",
  "shared.ctaText": "Search trains across Europe and save your own travel plan.",

  "style.title": "How would you like to travel?",
  "style.recommended": "Recommended",
  "style.recommended.desc": "Best overall balance of time, changes and simplicity.",
  "style.fastest": "Fastest",
  "style.fastest.desc": "Shortest total journey time.",
  "style.comfortable": "Comfortable",
  "style.comfortable.desc": "Fewer changes and safer connection margins.",
  "style.scenic": "Scenic",
  "style.scenic.desc": "Longer routes with a finer railway experience.",
  "style.cheapest": "Cheapest",
  "style.cheapest.desc": "Lowest estimated ticket price.",
  "style.unavailable": "Not available – we don't have reliable data for this yet.",

  "prefs.title": "Journey preferences",
  "prefs.minTransfer": "Minimum connection time",
  "prefs.maxTransfers": "Maximum number of changes",
  "prefs.any": "Any",
  "prefs.avoidNightTrains": "Avoid night trains",
  "prefs.avoidOvernight": "Avoid overnight travel",
  "prefs.avoidStationChange": "Avoid station changes within a city",
  "prefs.preferDirect": "Prefer direct trains",
  "prefs.preferHighSpeed": "Prefer high-speed trains",
  "prefs.avoidBuses": "Avoid buses and replacement buses",
  "prefs.maxPerDay": "Maximum travel per day",
  "prefs.noLimit": "No limit",
  "prefs.hoursN": "{n}h",
  "prefs.saved": "Your preferences are saved.",

  "score.label": "Euroute Score",
  "score.why": "How the score is built",
  "score.time": "Travel time",
  "score.changes": "Changes",
  "score.connections": "Connections",
  "score.simplicity": "Simplicity",
  "score.dayComfort": "Time of day",
  "score.preferenceFit": "Your preferences",
  "score.note":
    "The score compares the journeys in this search with each other – it is not a universal measure of travel quality.",

  "score.extreme": "Extra long journey",
  "reason.direct": "A direct train all the way – no connections to miss.",
  "reason.fastestAndSafe":
    "Shortest travel time in this search, with plenty of time at every change.",
  "reason.balanced": "The best combination of travel time, changes and comfortable connections.",
  "reason.fewChangesSafe": "Only {n} changes and plenty of time at each one.",
  "reason.safeConnections": "Plenty of time at every change, with a reasonable travel time.",
  "reason.fastest": "Shortest travel time in this search.",
  "reason.bestAvailable": "The best journey available for this search – note the remarks below.",
  "cat.fewerChanges": "Fewer changes",
  "cat.saferConnections": "Safer connections",
  "cat.laterDeparture": "Later departure",
  "cat.earlierArrival": "Arrives earlier",
  "cat.alsoFastest": "Also fastest",
  "hl.muchLonger": "{time} longer than the fastest journey",
  "cat.recommended": "Recommended",
  "cat.fastest": "Fastest",
  "cat.comfortable": "Comfortable",

  "conn.comfortable": "Plenty of time to change",
  "conn.tight": "Short time to change",
  "conn.risky": "Very short time – you may miss the train",
  "conn.minutes": "{min} min connection",
  "conn.longWait": "Long wait ({time})",
  "conn.recommend": "We recommend at least {min} minutes for this connection.",
  "conn.stationChange": "Change of station within the city",

  "option.view": "View journey",
  "option.hide": "Hide details",
  "option.showMore": "Show more journeys",
  "option.showLess": "Hide extra journeys",
  "option.moreCount": "{n} more journeys",

  "hl.direct": "Direct train, no changes",
  "hl.fewChanges": "Only {n} changes",
  "hl.comfortableConnections": "Comfortable connections",
  "hl.tightAt": "Tight connection in {station} ({min} min)",
  "hl.riskyAt": "Risky connection in {station} ({min} min)",
  "hl.longWaitAt": "Long wait in {station} ({time})",
  "hl.stationChange1": "One station change within a city",
  "hl.stationChanges": "{n} station changes within a city",
  "hl.noStationChange": "No station changes",
  "hl.hasBus": "Includes a bus leg",
  "hl.nightTrain": "Night train – you sleep on board",
  "hl.overnight": "Travel continues overnight",
  "hl.dayTrains": "Day trains",
  "hl.matchesPreferences": "Matches your preferences",

  "data.priceUnavailable": "Price data is not available from the timetable source.",
  "data.scenicUnavailable": "We don't have reliable scenic railway data yet.",

  "prefs.allowOvernightStop": "Suggest an overnight stop on the way",

  "on.loading": "Checking whether an overnight stop would improve this journey …",
  "on.title": "A more comfortable way to travel",
  "on.split": "Split the journey in {city}",
  "on.view": "Show the overnight journey",
  "on.hide": "Hide the overnight journey",
  "on.continue": "Continue without an overnight stop",
  "on.day": "Day {n}",
  "on.stay": "Stay overnight in {city}",
  "on.stayArrival": "Arrival {time}",
  "on.stayNext": "Next train {time}",
  "on.stayWait": "{time} in {city}",
  "on.nights": "{n} nights",
  "on.summary": "{days} travel days · longest day {longest} · {changes} changes",
  "on.added": "{time} more time on trains than travelling straight through",
  "on.addedNone": "No extra time on trains compared with travelling straight through",
  "on.benefitsTitle": "What you gain",
  "on.others": "Other overnight options",
  "on.otherOption": "Stay in {city}",
  "on.chooseTitle": "I want to stay overnight in:",
  "on.chooseHint": "We build the journey around your stop using real timetables.",
  "on.chooseSubmit": "Plan with this stop",
  "on.chooseClear": "Clear the stop",
  "on.unavailable": "We found no journey that works for an overnight stop in {city}.",
  "on.limitMissed": "We found no journey where every travel day stays under {h} hours.",
  "on.limitClosest": "Closest alternative: the longest travel day is {time}.",
  "on.noneFound":
    "We found no overnight stop that clearly improves this journey. Travelling straight through is still your best option.",

  "on.benefit.noNightTravel": "No travelling through the night",
  "on.benefit.balancedDays": "Balanced travel days ({d1} and {d2})",
  "on.benefit.shorterDays": "Longest travel day {time}",
  "on.benefit.comfortableConnections": "Plenty of time for changes",
  "on.benefit.noStationChange": "No station changes",
  "on.benefit.withinLimit": "Every travel day under {h} hours",
  "on.benefit.eveningArrival": "Evening arrival, with time to check in and eat",

  "on.reason.withinLimit":
    "A night in {city} keeps every travel day under {h} hours – the longest day becomes {time}.",
  "on.reason.noNightBalanced":
    "{city} splits the journey into two balanced days ({d1} and {d2}) and avoids travelling through the night.",
  "on.reason.noNight": "Staying overnight in {city} means you avoid travelling through the night.",
  "on.reason.saferConnections":
    "A night in {city} removes {n} pressured connections and gives better margins.",
  "on.reason.balanced": "{city} splits the journey into two manageable days ({d1} and {d2}).",
  "on.reason.shorterDays": "With a stop in {city} the longest travel day becomes {time}.",

  "on.badgeAlt": "Split the journey on the way",
  "on.headingAlt": "The journey can be split in {city}",
  "on.showDetails": "Show details",
  "on.hideDetails": "Hide details",
  "on.dayHeading": "Day {n}",
  "on.dayRoute": "{from} → {to}",
  "on.dayTimes": "{dep} → {arr}",
  "on.nightIn": "Overnight stay in {city}",
  "on.nightArrival": "Arrival {time}",
  "on.nightDeparture": "Next day's departure {time}",
  "on.betweenTrains": "{time} between trains",
  "on.whyCity": "Why {city}?",
  "on.trainTime": "{time} on trains",

  "on.benefit.rest.veryGood":
    "Plenty of time for an evening and a night before the next travel day",
  "on.benefit.rest.good": "A reasonable overnight window before the next travel day",
  "on.benefit.manageableDays": "Manageable travel days (longest {time})",

  "on.warn.longDay": "Long travel day {n} ({time})",
  "on.warn.extremeDay": "Very long travel day {n} ({time})",
  "on.warn.riskyConnection": "Short connection in {city} ({min} min)",
  "on.warn.tightConnection": "Tight connection in {city} ({min} min)",
  "on.warn.rest.short": "Short overnight window ({arrival}–{departure})",
  "on.warn.rest.poor": "Little time to rest ({arrival}–{departure})",
  "on.warn.stillNightTravel": "Part of the journey still runs through the night",
  "on.warn.addedTime": "{time} longer than travelling straight through",
  "on.warn.stationChange": "{n} station changes",
  "on.warn.overLimit": "The longest travel day is {time}, above your {h} hour limit",

  "on.tradeoff.longDay": "You get a long travel day {n} ({time}).",
  "on.tradeoff.nightVsLongDay":
    "You avoid travelling through the night, but get a long travel day {n} ({time}).",
  "on.tradeoff.risky": "The journey still contains a short connection.",
  "on.tradeoff.rest": "The overnight stop leaves limited time to rest.",
  "on.tradeoff.overLimit": "The longest travel day becomes {time}, above your {h} hour limit.",
  "on.tradeoff.addedTime": "The split costs {time} of extra travel time.",

  "on.reason.bestOfCompared":
    "{city} gives the best overall result of the {n} overnight stops we compared – travel-day lengths, night rest and onward connections weighed together.",

  "nav.account": "Account",
  "footer.noTickets":
    "Euroute doesn't sell tickets and can't see availability or prices. Every leg is booked with the railway operator or a booking partner.",
  "footer.privacy": "Privacy",

  "privacy.h1": "Privacy and personal data",
  "privacy.lead":
    "Euroute is a planning tool for European train travel. We keep as little data as possible – and only what's needed for the search, your saved travel plans and to keep the service running.",
  "privacy.data.title": "What we store",
  "privacy.data.text":
    "Without an account: nothing about you is stored. Searches are sent to the timetable service to get results, and are not saved to a user.\n\nWith an account: your email address (through the login service), your saved travel plans with the itinerary snapshot, your own notes, your travel preferences, and which parts of a journey you've marked as booked.\n\nWhen someone opens a booking link we store a technical event – which leg, which operator and a one-way hash of network data – to see which links are used. The hash can't be turned back into an IP address.",
  "privacy.why.title": "Why",
  "privacy.why.text":
    "Account data exists so you can come back to your travel plans on any device. Booking events exist so we can tell which booking links actually work. We don't use your data for advertising, profiling or resale, and we don't share it with railway operators.",
  "privacy.keep.title": "How long",
  "privacy.keep.text":
    "Saved travel plans, notes, booking marks and preferences are kept until you delete them or delete your account. Booking events are kept anonymised as aggregate statistics.",
  "privacy.third.title": "Services we use",
  "privacy.third.text":
    "Timetable data comes from open European sources via Transitous. Search terms (place names, date and time) are sent there to produce results.\n\nAccounts, database and hosting run on our infrastructure provider inside the EU.\n\nBooking links lead to the railway operators' and booking partners' own sites, where their terms and privacy policies apply.",
  "privacy.rights.title": "Your rights",
  "privacy.rights.text":
    "You can export all your data as a file, and delete your account with everything in it, under Account. Deletion is immediate and cannot be undone. You can also request correction of your data, or object to how it's used.",
  "privacy.cookies.title": "Cookies",
  "privacy.cookies.text":
    "We use no advertising or analytics cookies. The browser stores your login session and your language choice – nothing else.",
  "privacy.contact.title": "Contact",
  "privacy.contact.text":
    "For questions about your personal data, or to exercise your rights, contact the person responsible for Euroute: [add your contact email].",

  "account.h1": "My account",
  "account.lead": "Your login details, a copy of your data, and permanent deletion.",
  "account.detailsTitle": "Login",
  "account.email": "Email",
  "account.exportTitle": "Download your data",
  "account.exportText":
    "You get a file with your saved travel plans, booking marks and travel preferences.",
  "account.exportCta": "Download file",
  "account.exportFailed": "Couldn't create the file. Please try again.",
  "account.deleteTitle": "Delete account",
  "account.deleteText":
    "This deletes your account, all saved travel plans, notes, booking marks and preferences. Statistics about booking clicks are kept anonymised, with no link to you. The deletion is permanent.",
  "account.confirmWord": "DELETE",
  "account.confirmLabel": "Type {word} to confirm",
  "account.deleteCta": "Delete my account permanently",
  "account.deleted": "Your account and all your data have been deleted.",
  "account.deleteFailed": "Couldn't delete the account. Please try again.",
};

const DICTS: Record<Lang, Dict> = { sv, en };

export type Translate = (key: string, vars?: Record<string, string | number>) => string;

function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const template = DICTS[lang][key] ?? DICTS.sv[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`));
}

type Ctx = { lang: Lang; setLang: (lang: Lang) => void; t: Translate };

const LanguageContext = createContext<Ctx>({
  lang: "sv",
  setLang: () => {},
  t: (key, vars) => translate("sv", key, vars),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("sv");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "sv" || stored === "en") {
      setLangState(stored);
      return;
    }
    const browser = window.navigator.language?.toLowerCase() ?? "";
    if (browser && !browser.startsWith("sv")) setLangState("en");
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang: (next) => {
        setLangState(next);
        try {
          window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* ignore */
        }
      },
      t: (key, vars) => translate(lang, key, vars),
    }),
    [lang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  return useContext(LanguageContext);
}

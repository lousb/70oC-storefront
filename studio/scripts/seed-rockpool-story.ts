/**
 * Seeds a DRAFT "Rockpool House" story matching the
 * Set-Up-Components/Individual Stories mockups, so the story template
 * can be checked end to end. Safe to re-run: it overwrites the same
 * draft (drafts.story-rockpool-house) and Sanity de-dupes the images.
 *
 * Run from /studio (uses your own Sanity CLI login):
 *   npx sanity exec scripts/seed-rockpool-story.ts --with-user-token
 */
import { createReadStream } from "node:fs";
import path from "node:path";
import { getCliClient } from "sanity/cli";

const client = getCliClient({ apiVersion: "2024-10-01" });
const IMG_DIR = path.resolve(process.cwd(), "../Set-Up-Components/Individual Stories/_seed");

let keyN = 0;
const key = () => `k${(++keyN).toString(36)}${Math.random().toString(36).slice(2, 7)}`;

// Paragraph text with inline footnotes written as {{fn:Footnote text}}.
function para(text: string) {
  const children: any[] = [];
  const re = /\{\{fn:(.+?)\}\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    children.push({ _type: "span", _key: key(), text: text.slice(last, m.index), marks: [] });
    children.push({ _type: "storyFootnote", _key: key(), text: m[1] });
    last = m.index + m[0].length;
  }
  children.push({ _type: "span", _key: key(), text: text.slice(last), marks: [] });
  return { _type: "block", _key: key(), style: "normal", markDefs: [], children };
}

const qa = (question: string, paragraphs: string[]) => ({
  _type: "storyQuestionBlock",
  _key: key(),
  continuation: false,
  asker: "70oC",
  question,
  answerer: "RE",
  answer: paragraphs.map(para),
});
const continued = (paragraphs: string[]) => ({
  _type: "storyQuestionBlock",
  _key: key(),
  continuation: true,
  answer: paragraphs.map(para),
});
const quote = (text: string) => ({ _type: "storyHeaderBlock", _key: key(), text });

async function upload(file: string) {
  const asset = await client.assets.upload("image", createReadStream(path.join(IMG_DIR, file)), {
    filename: file,
  });
  console.log("  uploaded", file);
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}
const media = (image: any) => ({ _type: "media", mediaType: "image", image });

const FN_HERNST = "Notably, Karl Hernst protested against this idea through a series of essays entitled “Ein Schrifingre”.";
const FN_BOARD = "In its announcement, it was declared a unanimous winner by the festival’s curated selection board.";
const FN_LAW = "Recent legislative changes have made this process impossible.";

async function run() {
  console.log("Uploading images from", IMG_DIR);
  const [hero, full, centered, left, right] = await Promise.all([
    upload("01-hero.jpg"),
    upload("02-full.jpg"),
    upload("03-centered.jpg"),
    upload("04-double-left.jpg"),
    upload("05-double-right.jpg"),
  ]);

  const doc = {
    _id: "drafts.story-rockpool-house",
    _type: "post",
    title: "Rockpool House",
    slug: { _type: "slug", current: "rockpool-house" },
    credits: [
      { _type: "credit", _key: key(), role: "Words", name: "Roger Eckstein" },
      { _type: "credit", _key: key(), role: "Photos", name: "Saskia Wilson" },
    ],
    date: "2026-04-01",
    readDuration: 8,
    category: "Balance",
    excerpt:
      "On an unusually overcast Sunday afternoon, Post- sat down with a pixelated facsimile of Liam Young. A conversation about architecture and fiction ensued. In this issue we relay an edited transcript of that conversation—sans compression artefacts, lag or the digital echoes of deinterlaced signals.",
    cover: media(hero),
    pageBuilder: [
      qa("Could you explain what ‘world building’ is?", [
        "Essentially, what I do through my work and the work through the program at SCI-Arc is a world building program. It’s a technique that comes from cinema that basically rewires the traditional linear process of telling stories. So, traditionally a film would start with a script and that script would start to get names attached, get funding and then at that point it would go into development, bringing a production designer on board to flesh out the world of that film. You would then shoot, edit and post produce it to make the film.",
        "World building puts the creation of the world before all of that. Rather than developing a script, a narrative or a set of characters you develop a world. You then inhabit that world with characters, a story, and just following those characters through their most logical interactions of the spaces and structures in the world around them - this is an architectural way of thinking about film.",
        "One of the big proponents of world building is Alex McDowell who was the production designer that worked on Stephen Spielberg’s Minority Report. He came on board with a group of technologists and futurists well before there was a script for the film. They were tasked with imagining this future city and they developed the whole design for that city. They imagined where it would sit in America, the traffic infrastructure and the road network - even the nature of the screen in this future world. The gestural interface, for example, was developed as real tech with a group of designers and technologists from Silicon Valley. Out of that one film came over 100 patents for new technologies.",
        "How they developed the story from there was simply to put Tom Cruise's character into that world. They then started writing a script.",
        `The vertical car chase was only something that could have emerged{{fn:${FN_HERNST}}} if you had designed the world in the first place. It required the vertical traffic network - with the mechanisms and concepts of that specific transportation infrastructure in place - only then could you have Tom Cruise’s character crash out the window of his apartment and start hitching rides on cars driving on the sides of buildings.`,
        "That's really what we do at SCI-Arc, we design imaginary worlds that become the setting for stories and we use them as a way of looking back on our own world in new ways, and that is something that I think architects do really well.",
      ]),
      { _type: "storyMediaBlock", _key: key(), layout: "single", width: "fullWidth", media: media(full) },
      qa("What do you see as the architect’s role in generating these fictional worlds?", [
        "What we try and do both in my work and in the program at SCI-Arc is look at the ways that architects can parasitically occupy and operate within the mediums of popular culture.",
        `When we're talking about architecture and fictions, I am less talking about speculative architecture projects or the traditions of paper architecture - the sort of stuff that students do in kinky design studios at architecture school - I'm talking about architects operating outside of architecture entirely and entering the entertainment industry as directors, concept designers or environment designers for films or video games - or even in VR, advertising or documentary filmmaking. I think the days of the speculative architecture project are numbered, or at least I see more capacity to affect change by moving outside of our discipline, whilst still operating as architects but working specifically through fiction. So that's what we're trying to do.{{fn:${FN_HERNST}}} I try to treat cinema as a kind of site through which to talk about architecture and urban ideas.`,
        "And that's what we try to do with our students. They don't make some crazy speculative building, they make a film that is designed for, say, the Sundance Film Festival or as a pilot for a TV show or a short film that's used to pitch for a feature film. At the very least it’s something that is designed for the web to get 100,000 views. That’s 100,000 more views than any one architecture project is going to get.",
      ]),
      quote(
        "“I think the days of the speculative architecture project are numbered, or at least I see more capacity to affect change by moving outside of our discipline, whilst still operating as architects but working specifically through fiction.”",
      ),
      qa("Are we seeing the marginalisation of the architect in the built environment?", [
        `I think the built environment is something that structures all of our lives. And, yes, the architect’s role in shaping that environment is becoming increasingly marginalised.{{fn:${FN_BOARD}}} We need to begin looking for alternative ways to affect it - moving beyond the making and shaping of a building as a merely physical object - because for the most part{{fn:${FN_LAW}}} that building is defined by areas outside the remit of the traditional architect. It is shaped primarily by the forces that govern the property developer or the real estate agent.`,
        "The way we start to affect and shape those forces is by guiding and instigating the cultures that exist around them. With fiction we can start to shape those cultures - and in doing so we have a much larger reach than the making and shaping of any singular building. It is through this paradigm shift in the realignment of urban culture that we're going to get substantial change. Causing the architect to operate as a cultural agent as opposed to a building agent, in my mind, is the most effective way we can play a role in shaping our futures.",
        "Traditionally it is through fiction that cultures have shared and disseminated ideas. It is a shame that architects aren't better at engaging people in those mediums and aren’t better at disseminating the really urgent and critical things that we speak about as practitioners but are unable to communicate as individuals. Fiction in this sense is a really powerful medium.",
      ]),
      { _type: "storyMediaBlock", _key: key(), layout: "single", width: "centered", media: media(centered) },
      qa("What are you currently working on at SCI-Arc?", [
        `What we're doing at the moment is looking at the themes of the post-human. By that{{fn:${FN_BOARD}}} I don't mean cyborgs and replacing eyeballs with digital lenses. I mean thinking about the ways that a lot of our spaces and cities are being designed not for people any longer but for machines or at the very least machine vision.`,
        "We are exploring new narratives that don't put the human at the centre of the story. Instead we look at the alternative subject positions that emerge when some of the dominant actors in this space are actually algorithms or the countless bestiary of machines.",
        "We did a film ‘Where the City Can’t See’ which is told in part from the perspective of a driverless car. It's a film that is shot entirely through laser scanners, the technology that driverless cars use to see and scan the world. It is the first of our explorations into what it means for a story to be told from the perspective of an autonomous vehicle.",
        "In another film we produced ‘In the Robot Skies’. The drone was the active narrative engine of the film. What we did was program a series of GPS points from which the drone could make its own decisions about how to catalogue the characters and their reactions. The actors are just running through their scenes over and over again. The drone would follow them initially and start to make its own choices of what it wanted to focus on.",
      ]),
      quote(
        "“We were interested in the ways that a surveillance drone might actually view and see the world and view and see ourselves within that world.”",
      ),
      continued([
        `We are interested in something as apparently absurd as the notion of what happens when the protagonist is an internet connected toaster? What does it{{fn:${FN_LAW}}} mean if someone’s best friend is a very dumb comfort bot? Or what does it mean to tell the story of the city through the operating system of the city? Or what does it mean to design a city and a space for non-human inhabitants? And that is leading to very novel forms of film-making.`,
        "We are in the territory of post-cinema where the traditional genres we understand like romantic comedy, horror, drama etc. don't necessarily apply anymore. We are taking traditional characters out of the equation and looking for new storytelling potential that comes out of the context of this new technology.",
      ]),
      {
        _type: "storyMediaBlock",
        _key: key(),
        layout: "double",
        width: "fullWidth",
        media: media(left),
        secondMedia: media(right),
      },
      qa("What emerges in response to this non-human reorientation?", [
        "What I do in my own projects is explore the subculture of outcomes of these technologies. Gibson has a great quote that he uses when he talks about the way that he thinks about technology in his books, which is “the street find its own uses for things”. So the point that he's most interested in with new technology is when it hits the street and it becomes democratised. That's when it gets used and reapplied in strange and unexpected ways. And that's really where we site a lot of our own film work through the narrative development - in thinking about the ways in which sub-cultures might start to work with and use these technologies.",
        "So in ‘Where the City Can't See’, we looked at rave culture. We developed a new vocabulary of dance movements that are designed to evade body detection algorithms. We developed new textiles and a new hoody that's designed to create glitches and distortions when it's seen through the eyes of a driverless car or through CCTV laser scanners. We worked with Adam Harvey an artist that designs make up systems to fool facial recognition technologies. And those same textiles were used ‘In the Robot Skies’ to create hoodies that would evade drone based camera systems.",
        "They’re not just storytelling elements they're inventions. We're designing products. They become very real when you engage the technology and inhabit the fictions themselves in this way.",
      ]),
    ],
  };

  await client.createOrReplace(doc);
  console.log("Done: draft saved as", doc._id, "- open Stories in Studio to review/publish.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

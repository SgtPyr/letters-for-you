(() => {
  "use strict";

  // Read-only notebook: there are no editing or saving controls.
  const STORAGE_KEY = "littleNotebook.v1";

  const starterNotes = [
    {
      title: "It Started With a Letter — Chapter 1",
      body: "I made this website a long time ago. Back then, everything was handwritten. It all started when you told me it was the first time someone had ever given you handwritten letters.\n\nFor some reason, that little detail stayed with me. And then, I had a clever idea.\n\nWhat if I made something that could hold more than just a few letters? Somewhere I could put my thoughts into words, keep little memories, and leave you something you could come back to whenever you felt like reading.",
    },
    {
      title: "It Started With a Letter — Chapter 2",
      body: "Do you remember that time I showed up with halo-halo when you were having a rough day? There was a letter hidden inside it, and behind the note, I wrote, \"Bayaran mo yan.\"\n\nThat was the letter I meant. The one that came with the halo-halo, with a little joke written behind it. I was teasing you, obviously, but I also wanted to do something thoughtful for you. Something small that might make a difficult day a little better.\n\nI didn't really meant the \"bayaran mo yan\" part. Bintahi.",
    },
    {
      title: "It Started With a Letter — Chapter 3",
      body: "Looking back, it's funny how that one handwritten letter became part of the reason I wanted to make this website.\n\nI started thinking about how I could give you more than a single note, more than a moment you might eventually forget. I wanted to make somewhere I could leave you little pieces of my thoughts, memories, and things I don't always say out loud.\n\nSomething you could return to whenever you wanted, without needing to keep a stack of handwritten papers safe somewhere.",
    },
    {
      title: "It Started With a Letter — Chapter 4",
      body: "And now, here we are. A whole notebook, all because you once told me something as simple as never having received handwritten letters before.\n\nI don't know if you realized how much that little detail would stick with me. Maybe you were just sharing something about yourself, and I was sitting there quietly turning it into an idea in my head.\n\nApparently, that's what happens when you tell me something. Sometimes I listen. Sometimes I remember. And sometimes I turn it into an entire project.",
    },
    {
      title: "It Started With a Letter — Chapter 5",
      body: "This website isn't made of paper, and you won't find my handwriting on these pages. But the thought behind it is pretty similar to that first letter.\n\nI wanted to give you something personal. Something made with you in mind, filled with memories, little reminders, random thoughts, and words I might not always find the right moment to say out loud.\n\nMaybe it's a little unconventional to turn that idea into a website, but making things has always been one way I know how to express myself.",
    },
    {
      title: "It Started With a Letter — Chapter 6",
      body: "So, if you ever wondered why I made this, that's the story.\n\nIt started with you telling me you'd never received handwritten letters before. It continued with a letter tucked inside some halo-halo, with \"Bayaran mo yan\" written behind it. And somewhere along the way, that small idea grew into this notebook.\n\nOne little conversation, one handwritten letter, and one questionable joke later, you ended up with an entire website.\n\nBintahi. You really had no idea what you were starting when you told me that story.\n\nAnyway, I hope this notebook makes you smile whenever you read it. That's all I really wanted from the beginning.",
    },
    {
      title: "A Little Reminder Before the Next Chapter",
      body: "Before you move on to the next chapter, take a little moment here. No need to rush through everything, bintahi. This notebook isn't going anywhere.\n\nEvery page has its own little story, and there's no deadline for reading them all. Take your time, smile at the silly parts, and keep the ones that mean something to you.\n\nAnd if you ever forget where you left off, consider this your reminder: you still have more pages to read. Sus, may assignment ka pa pala.",
    },
    {
      title: "The Chapter Began With One Cast — Chapter 1",
      body: "I just remembered one of the most unforgettable moments we had. The time I brought you and our friend to my fishing spot and decided to teach you how to cast a fishing rod.\n\nI thought it would be a simple little fishing trip. I'd show you how to cast, you'd give it a try, and maybe we'd catch some fish along the way. A pretty reasonable plan, right? Well, apparently, I forgot to account for one very important possibility.\n\nYour very first cast.\n\nThe fish were safe that day. Our friend, however, wasn't.\n\nFirst cast: zero fish caught, one friend caught. Congratulations. You managed to catch something without even getting near the water the way you were supposed to. Bintahi, not exactly what you were aiming for, was it?",
    },
    {
      title: "The Chapter Began With One Cast — Chapter 2",
      body: "What makes that moment unforgettable isn't just what happened. It's the fact that it was your very first attempt at casting a fishing rod, and somehow, it immediately became a memory worth keeping.\n\nI was supposed to be teaching you how to fish, not introducing you to a completely different kind of target practice. Our friend probably didn't expect to become part of the lesson either.\n\nBut that's what made it funny. We went there to fish, and instead, we got a story that still deserves to be written down. The fish went about their day in peace, while our friend became an accidental part of fishing history.\n\nI don't even know what the official fishing record is for catching a friend on the first cast, but I'm pretty sure you made a strong case for it.",
    },
    {
      title: "The Chapter Began With One Cast — Chapter 3",
      body: "Looking back, I'm glad I got to share that little experience with you. It wasn't some big planned event or a perfect day where everything went according to plan. It was just us at my fishing spot, me trying to teach you something new, and one cast that went somewhere nobody expected.\n\nMaybe you didn't catch a fish that day, but you definitely left with a story. And honestly, I'd say that's a pretty memorable first attempt.\n\nSo whenever you think about learning how to fish, remember the important lesson: watch where the rod is pointing before you cast. The fish aren't the only ones who deserve to feel safe around you.\n\nAnd to our friend, wherever you are, I'm sorry your role in this memory is permanent. You were supposed to come fishing, not become the catch. Bintahi.",
    },
    {
      title: "When Are We Fishing Again?",
      body: "I just realized we haven't gone fishing together in a while. I wonder when we'll get to do that again. Remember when I brought you and our friend to my fishing spot and tried teaching you how to cast a rod?\n\nYour first cast was something else. Zero fish caught, one friend caught. Bintahi, we went there to catch fish, not our friend. I don't think I'll ever forget that.\n\nIt's been a while since that day, and it'd be fun to go fishing again sometime. Maybe we can visit the same spot or try somewhere new. Hopefully, you've improved your casting skills by then. For everyone's safety, especially our friend's.\n\nAnyway, I was just wondering when we'll go again. We should plan another fishing trip when we get the chance. This time, let's try to catch actual fish.",
    },
    {
      title: "That Day in July — Chapter 1",
      body: "I remember in July when you told me that it was going to be your last week staying there.\n\nThen, while you were preparing to leave, something went wrong. You accidentally transferred the money to the wrong person, and you didn't know what to do about it.\n\nYou ended up calling me and telling me what happened.",
    },
    {
      title: "That Day in July — Chapter 2",
      body: "I still remember that whole situation, especially because it all happened during what was supposed to be your last week there.\n\nAnd that's not even the whole story...\n\nThen came the worst part. Your supposed ''last week'' kept getting extended for several more weeks. You were completely exhausted and stressed, and there were nights when you cried until morning.",
    },
    {
      title: "That Day in July — Chapter 3",
      body: "It was painful watching you go through so much when all you wanted was for everything to finally be over.\n\nAnd just when you thought things couldn't get any more complicated, the money transfer happened again.\n\nEvery time you said, “This is my last week,” it somehow felt like another tragedy was waiting around the corner.",
    },
    {
      title: "That Day jn July — Chapter 4",
      body: "Then you accidentally sent ₱1,500 to the wrong person.\n\nAt that point, I swear, “this is my last week” had stopped sounding like an update and started sounding like a warning.\n\nEvery time you said it, I was probably thinking, What is going to happen this time?",
    },
    {
      title: "That Day in July — Chapter  5",
      body: "Looking back, the whole situation was stressful, exhausting, and honestly a little unbelievable.\n\nI know it wasn't funny while you were going through it, especially with all the crying and worrying.\n\nBut it's one of those memories from July that I don't think I'll forget anytime soon.\n\nAnd that's the part where you borrowed money from me.",
    },
    {
      title: "You Don't Have to Figure It Out Alone — Chapter 1",
      body: "And that's how you ended up borrowing money from me.\n\nBut honestly, when I look back on that moment, I don't just remember the money or everything that went wrong that July.\n\nI remember that you reached out to me when you didn't know what else to do.",
    },
    {
      title: "You Don't Have to Figure It Out Alone — Chapter 2",
      body: "I'm glad you felt you could come to me during a difficult time.\n\nI know I couldn't magically fix everything you were going through, but if I could help make things a little easier for you, even in a small way, then I'm glad I could be there.\n\nMaybe that's one of the things friendship is about.",
    },
    {
      title: "You Don't Have to Figure It Out Alone — Chapter 3",
      body: "Not always having the right answers or being able to solve every problem, but being someone you can turn to when life gets overwhelming.\n\nAnd if there's one thing I hope you remember from that whole experience, it's that you don't always have to figure everything out on your own.\n\nSometimes, it's okay to ask for help. And I'm glad you trusted me enough to ask.",
    },
    {
      title: "A Debt You Never Owed — Chapter 1",
      body: "Remember that time when you were having a rough day, and I showed up with halo-halo, with a letter hidden inside it?\n\nAnd behind the note, I wrote, “Bayaran mo yan.”\n\nFunny how that little joke became even more relevant later, when you actually had to borrow money from me.",
    },
    {
      title: "A Debt You Never Owed — Chapter 2",
      body: "Back then, I wrote those words just to tease you. But when July came around and everything seemed to be going wrong, you really did end up needing my help.\n\nFirst, there was the money you accidentally sent to the wrong person, then all the stress of trying to leave, and eventually, the ₱1,500 you accidentally sent to the wrong person again.\n\nAnd somewhere in the middle of all that chaos, you came to me and borrowed money.",
    },
    {
      title: "A Debt You Never Owed — Chapter 3",
      body: "So maybe, in a way, you finally got to “bayaran mo yan” that joke.\n\nBut honestly, I never wanted you to feel like you had to repay me for being there for you.\n\nI helped because you needed help, and because you're my friend. That's it.",
    },
    {
      title: "A Debt You Never Owed — Chapter 4",
      body: "The halo-halo, the letter, and the teasing might seem like separate little memories, but to me, they all carry the same meaning.\n\nWhether you were having a rough day and needed something sweet, or going through a difficult time and needed someone to lean on, I wanted you to know that you could come to me.",
    },
    {
      title: "A Debt You Never Owed — Chapter 5",
      body: "So yes, bayaran mo yan. Bintahi.\n\nBut if there's one thing you never have to pay back, it's the kindness I give you as your friend. That was never a debt.\n\nI just hope that whenever life gets difficult, you remember you don't always have to face it alone.",
    },
    {
      title: "You Went Quiet, And I Noticed — Chapter 1",
      body: "But honestly, beneath that assumption, I was wondering if you were okay.\n\nI know you have your own things going on, and I don't expect you to tell me every little detail about your day.\n\nStill, when someone I'm used to hearing from suddenly goes quiet, I notice.",
    },
    {
      title: "You Went Quiet, And I Noticed — Chapter 2",
      body: "I wondered how your night was going, whether something happened, or if you were just tired and needed some time to yourself.\n\nI didn't want to assume anything was wrong, but I couldn't help caring enough to wonder.\n\nMaybe you were just busy. Maybe you fell asleep. Maybe you really were out there causing trouble. Any of those would be very on-brand for you.",
    },
    {
      title: "You Went Quiet, And I Noticed — Chapter 3",
      body: "I just hope you were okay last night.\n\nYou don't always have to explain yourself to me, and you don't have to be in a good mood every time we talk.\n\nBut if something is bothering you, or if you're having one of those nights when everything feels a little heavier than usual, you don't have to pretend you're fine around me.",
    },
    {
      title: "You Went Quiet, And I Noticed — Chapter 4",
      body: "And if you were simply being a menace somewhere, then please continue your nonsense responsibly. I'd still rather hear that you were okay than find myself wondering whether you weren't.",
    },
    {
      title: "A Softer Start to Your Day — Chapter 1",
      body: "Rise and shine. I hope you woke up smiling, feeling rested and calm, with a little less weight on your shoulders today.\n\nI hope you slept well and that whatever was on your mind last night feels a little easier to carry this morning.\n\nYou deserve mornings that don't immediately ask too much of you, days that give you room to breathe, and little moments that remind you life isn't always as exhausting as it sometimes feels.",
    },
    {
      title: "A Softer Start to Your Day — Chapter 2",
      body: "I hope something makes you smile today, even if it's something small.\n\nMaybe a good meal, a funny message, or some random nonsense that makes you laugh when you least expect it.\n\nAnd if you didn't wake up feeling your best, that's okay, too. You don't have to force yourself to be cheerful just because it's a new day. Take your time, breathe, and ease into it at your own pace.",
    },
    {
      title: "A Softer Start to Your Day — Chapter 3",
      body: "Just a little reminder from me: I'm rooting for you, even on the ordinary days when nothing particularly special happens.\n\nNow get up, sleepyhead. The world is waiting, unfortunately, and you still have nonsense to get into.\n\nAnd if you're still sleepy, go back to sleep for a bit. Just don't blame me when you wake up and half the day is gone. Knowing you, you'd probably sleep through everything and still complain about being tired.",
    },
    {
      title: "You're Allowed to Let It Out — Chapter 1",
      body: "I hope you know that crying doesn't make you weak.\n\nSometimes, things get too heavy, and you can't keep everything bottled up forever. You can try to be strong, tell yourself you're fine, and keep going like nothing bothers you, but that doesn't mean you have to hold everything in.\n\nYou've been crying since the day you were born. Before you could even speak, it was one of the ways you let the world know you were here. So why should it be something to be ashamed of now?",
    },
    {
      title: "You're Allowed to Let It Out — Chapter 2",
      body: "You don't always have to be the strong one. You don't have to explain every tear or pretend you're okay when you're not.\n\nIf something hurts, let yourself feel it. If you need to cry, cry. You can take your time putting yourself back together.\n\nAnd please remember that you don't have to go through every difficult moment alone. You don't need to hide the parts of yourself that are hurting just to make other people believe you're doing fine.",
    },
    {
      title: "You're Allowed to Let It Out — Chapter 3",
      body: "You're human. You're allowed to have bad days, to feel overwhelmed, and to fall apart sometimes.\n\nCrying doesn't mean you've given up. Sometimes, it simply means you've been holding on for a long time.\n\nSo be gentle with yourself, okay? You deserve the same kindness you give to everyone else. And if you ever need someone to listen, you don't have to pretend you're okay around me.",
    },
    {
      title: "Because It Was With You — Chapter 1",
      body: "One completely honest sentence I never had the courage or opportunity to say is this: There are things I remember because they happened with you, and I don't think I would remember them the same way otherwise.\n\nIt's strange how that works. Sometimes, the moment itself isn't anything extraordinary. It's just an ordinary day, a random conversation, or something that probably seemed insignificant at the time.\n\nBut somehow, when I look back on it, the fact that you were there makes it worth remembering.",
    },
    {
      title: "Because It Was With You — Chapter 2",
      body: "I think some memories become special because of the person we share them with.\n\nMaybe I wouldn't remember the exact words someone else said, or what happened on an ordinary afternoon. But when it comes to certain moments with you, little details tend to stick around longer than I expect them to.\n\nIt's not always about what happened. Sometimes, it's simply that you were there, and that was enough to make the moment feel different.",
    },
    {
      title: "Because It Was With You — Chapter 3",
      body: "I don't know if you remember those moments the same way I do. Maybe some of them have already slipped your mind, and that's okay. We don't always carry the same memories with us.\n\nBut I wanted you to know that some of the ordinary moments we've shared have stayed with me. Not because they were perfect or because something life-changing happened, but because they became little pieces of a friendship that means something to me.\n\nAnd I think that's what makes them special. If those same moments had happened with someone else, they probably wouldn't mean quite the same thing.\n\nThey happened with you. That's why I remember.",
    },
    {
      title: "The Way We Really Were — Chapter 1",
      body: "A memory I hope you remember too is one where neither of us was trying to impress the other.\n\nThere is something nice about remembering people as they actually were instead of only remembering the polished versions.\n\nNot the version of ourselves we show when we're trying to look good, say the right things, or make sure nobody sees our awkward side. Just us, being ourselves without thinking too much about it.",
    },
    {
      title: "The Way We Really Were — Chapter 2",
      body: "I think those are some of the best moments in a friendship. When you don't have to think carefully about every word you say or worry about how the other person might see you.\n\nYou can be weird, make questionable jokes, talk about absolutely nothing, or say something embarrassing without feeling like you have to recover your dignity immediately.\n\nNot every conversation has to be deep, and not every moment has to become a special memory. Sometimes, it's enough to sit around, talk nonsense, and let the time pass.",
    },
    {
      title: "The Way We Really Were — Chapter 3",
      body: "What I like about those moments is that nobody has to pretend. You don't have to be in a good mood all the time, have everything figured out, or come up with something interesting to say.\n\nYou can be tired, quiet, distracted, or completely ridiculous, and the moment can still be worth remembering.\n\nI think there's something comforting about being around someone without constantly feeling the need to prove that you're worth their time.",
    },
    {
      title: "The Way We Really Were — Chapter 4",
      body: "Maybe we don't remember every detail of those days. Maybe we wouldn't even agree on which moments were the most memorable.\n\nBut I hope there's at least one memory you can look back on and remember how natural everything felt. No pressure to impress each other, no need to make the moment bigger than it was, and no pretending to be someone we weren't.\n\nJust two people sharing a little piece of their lives, probably talking about something completely unserious.",
    },
    {
      title: "The Way We Really Were — Chapter 5",
      body: "I hope when you think of me, you don't only remember the things I said when I was trying to be thoughtful or the times I tried to do something nice for you.\n\nI hope you remember the ordinary version of me, too. The random conversations, the stupid jokes, the times I probably annoyed you, and all the little moments that didn't seem important at the time.\n\nBecause that's the version of our friendship I value most. Not something perfect or carefully put together, but something real.",
    },
    {
      title: "The Way We Really Were — Chapter 6",
      body: "And I hope you let yourself be remembered that way, too.\n\nYou don't have to be the funniest person in the room, the strongest person anyone knows, or the person who always has everything under control. You don't have to make yourself more interesting just to leave an impression.\n\nThe imperfect, unfiltered version of you is worth knowing, too. Even the version who gets tired, overthinks things, makes mistakes, and occasionally becomes a menace for absolutely no reason.",
    },
    {
      title: "The Way We Really Were — Chapter 7",
      body: "I guess what I'm trying to say is that I hope we never feel like we have to turn our friendship into something impressive just to make it meaningful.\n\nSome of the best things about knowing someone happen when neither person is trying to create a memory. You just spend time together, go through ordinary days, laugh at ridiculous things, and somehow end up with moments you carry long after they've passed.\n\nThose are the memories I hope stay with you, too. Not because everything was perfect, but because, for a little while, we could simply be ourselves around each other.",
    },
    {
      title: "The Little Things That Make Me Smile — Chapter 1",
      body: "You probably don't realize how often the little things you do make me smile.\n\nSometimes it's something funny you say, a random thought you decide to share, or the way you turn an ordinary conversation into something unexpectedly entertaining.\n\nThey're usually small moments, nothing worth making a big deal out of. But every now and then, I find myself remembering them later and smiling all over again.\n\nAnd no, I'm not going to tell you exactly which moments. I have a reputation to maintain.",
    },
    {
      title: "The Little Things That Make Me Smile — Chapter 2",
      body: "One thing I've come to appreciate about our conversations is that they don't always need a reason.\n\nWe don't have to discuss something important or come up with something interesting to say every time. Sometimes we just talk, share random nonsense, or tease each other over the smallest things.\n\nAnd somehow, those conversations can be just as memorable as the serious ones.\n\nI think there's something nice about having someone you can talk to without needing to plan what to say first.",
    },
    {
      title: "The Little Things That Make Me Smile — Chapter 3",
      body: "Sometimes, I'll remember something you said hours or even days later, and suddenly it becomes funny all over again.\n\nMeanwhile, you've probably forgotten the entire conversation and moved on with your life. Meanwhile, my brain has decided this particular moment deserves a replay.\n\nBintahi. Imagine being unintentionally entertaining enough to become a recurring thought in someone else's head.\n\nDon't let that go to your head, though. I refuse to encourage you.",
    },
    {
      title: "The Little Things That Make Me Smile — Chapter 4",
      body: "But it's not always about the funny things.\n\nSometimes, I appreciate the little things you share without realizing they matter. A random update about your day, something that's been bothering you, or a small detail you could've easily kept to yourself.\n\nThose moments remind me that friendship isn't built only through big gestures or unforgettable events. Sometimes, it grows through ordinary conversations and the small pieces of life people choose to share with each other.",
    },
    {
      title: "The Little Things That Make Me Smile — Chapter 5",
      body: "I hope you know that you don't have to do anything special to make your presence matter.\n\nYou don't have to be funny every day, always have something interesting to say, or constantly find ways to make people happy. You can have quiet days, boring conversations, and moments when you don't feel like doing much at all.\n\nI'm not expecting you to be entertaining. Although, somehow, you manage to be funny without even trying sometimes.",
    },
    {
      title: "The Little Things That Make Me Smile — Chapter 6",
      body: "I think that's what makes these memories feel genuine. They weren't carefully planned, and neither of us was trying to create something worth remembering.\n\nWe were just being ourselves. Talking about whatever came to mind, laughing at things that probably wouldn't make sense to anyone else, and making ordinary moments a little less ordinary.\n\nMaybe we won't remember every conversation years from now, but I hope a few of those little moments stay with us.",
    },
    {
      title: "The Little Things That Make Me Smile — Chapter 7",
      body: "If I ever seem to remember the smallest details about something you said, it's probably because those moments stayed with me longer than I expected.\n\nNot because you need to read too much into it, and not because every little thing has some hidden meaning. Sometimes, a memory is simply nice to have.\n\nAnd some memories are nice because they're connected to people we're glad to know.\n\nYou're one of those people for me.",
    },
    {
      title: "The Little Things That Make Me Smile — Chapter 8",
      body: "So here's one thing I wanted to put into words: I'm glad our friendship has room for all these little moments.\n\nThe random conversations, the teasing, the unexpected jokes, the occasional serious talks, and even the moments when one of us says something so questionable that the other has to pause and reconsider the friendship.\n\nBintahi. I'm kidding. Mostly.\n\nBut really, thank you for being part of these memories. You might see them as ordinary moments, but some of them have made my days better in ways you probably never noticed.\n\nAnd I think that's worth telling you, at least once.",
    },
    {
      title: "Conversations That Didn't Need a Purpose — Chapter 1",
      body: "Something I'm grateful for is being able to have conversations with you that don't need to accomplish anything.\n\nSometimes we talk about the most random things, jump from one topic to another, or spend time saying absolutely nothing important. There's no particular reason for the conversation, no goal we're trying to reach, and no need to make every message meaningful.\n\nAnd honestly, I think that's one of the nice things about having you as a friend. We don't always need a reason to talk. Sometimes, talking is enough.",
    },
    {
      title: "Conversations That Didn't Need a Purpose — Chapter 2",
      body: "I think there's a kind of comfort in being able to talk to someone without constantly wondering what to say next.\n\nWe can joke around, share random thoughts, complain about something small, or talk about things that probably won't matter by tomorrow. Not every conversation has to turn into advice, a serious discussion, or some life-changing realization.\n\nSometimes, we just want to share a thought with someone and see where the conversation goes.\n\nAnd somehow, even the most pointless conversations can become the ones we remember.",
    },
    {
      title: "Conversations That Didn't Need a Purpose — Chapter 3",
      body: "Maybe that's why I appreciate those ordinary conversations more than I usually admit.\n\nThere's no pressure to be interesting all the time. I don't have to come up with something clever, and you don't have to have some amazing story to tell me. We can just talk about whatever comes to mind.\n\nAnd if the conversation gets ridiculous, well, that's hardly a surprise with us.\n\nBintahi, sometimes we start with one topic and end up somewhere that makes absolutely no sense. How does that even happen?",
    },
    {
      title: "Conversations That Didn't Need a Purpose — Chapter 4",
      body: "The thing is, spending time with someone doesn't always mean doing something special together.\n\nSometimes, it's just checking in, exchanging a few messages, or sharing something that reminded you of the other person. Even a short conversation can make an ordinary day feel a little less ordinary.\n\nYou might not think much of those moments because they happen so naturally. But I think there's something meaningful about being able to share the little, uneventful parts of life with someone.",
    },
    {
      title: "Conversations That Didn't Need a Purpose — Chapter 5",
      body: "I don't expect every conversation we have to be memorable, and I don't expect us to always have something to say.\n\nThere will be busy days, quiet days, and times when neither of us feels like talking much. That's normal. A friendship doesn't have to be constantly entertaining to be worth keeping.\n\nI'm just grateful for the times when we do get to talk, whether it's about something important or something so random that I wonder how we even got there.",
    },
    {
      title: "Conversations That Didn't Need a Purpose — Chapter 6",
      body: "Maybe one day, we'll forget most of the things we talked about. The random jokes, the little complaints, the stories that seemed important for five minutes, and all the nonsense in between.\n\nBut I hope we remember how easy it could feel to share those moments. How we didn't always need a plan or a reason. How an ordinary conversation could simply be a nice part of an ordinary day.\n\nBecause sometimes, the point isn't what we talked about. It's that we got to spend a little time talking to each other.",
    },
    {
      title: "Conversations That Didn't Need a Purpose — Chapter 7",
      body: "So, thank you for all the conversations that didn't need a purpose.\n\nFor the random messages, the unnecessary teasing, the unexpected topics, and even the conversations where neither of us had anything particularly interesting to contribute.\n\nI'm glad we didn't need every moment to be special for it to mean something.\n\nAnd if you ever think you're bothering me by telling me something random, just remember that I've willingly participated in plenty of our nonsense, too. I'm not exactly an innocent party here.\n\nSometimes, talking about absolutely nothing is still a way of spending time with someone. And I'm glad I've gotten to spend some of that time with you.",
    },
    {
      title: "The Day I Sent You Your-Debt",
      body: "Hahaha, I still wonder what went through your mind when I sent you the Your-Debt website. Like, out of all the things I could make, why did I decide to make a whole website about debt? Bintahi.\n\nI can already imagine you opening the link and wondering what kind of nonsense I had made this time. A normal person might send a message or make a simple joke, but apparently, I decided that wasn't enough. I had to turn the joke into an actual website.\n\nHonestly, I don't even know what reaction I was expecting from you. Maybe you'd laugh, maybe you'd question my sanity, or maybe you'd just think, \"What is wrong with this guy?\" All of those would be reasonable reactions, to be fair.\n\nBut that's one of the funny things about being friends with me. Sometimes, a random idea enters my head, and before you know it, there's an entire website waiting in your messages. You never really know what I'm going to make next.\n\nAnyway, I hope you found it funny. And don't worry, this notebook isn't a collection agency. You can read in peace. Hahaha.",
    },
    {
      title: "A Work in Progress",
      body: "Honestly, I'm not even sure when I'll finish making this. I keep coming up with ideas, remembering little things, and thinking of more words I want to put here. Every time I think I'm getting somewhere, my brain decides there's something else to add. Bintahi, this notebook might take longer than I expected.\n\nSo if you're reading this while I'm still working on it, just know that this is a work in progress. Some pages might already be here, while others are still waiting for their turn. I'm making everything little by little, whenever I have the time and an idea worth writing down.\n\nI don't have a definite date for when it'll be finished. Maybe soon, maybe not. I just know I don't want to rush through it for the sake of saying it's done.\n\nFor now, you can read what's already here. And who knows? The next time you open this website, there might be something new waiting for you. Consider it a little surprise from your very unorganized notebook maker.",
    },
    {
      title: "You Made It This Far",
      body: "If you actually managed to read everything up to this point, congratulations. You have officially survived my collection of stories, random thoughts, and unnecessary nonsense.\n\nI honestly didn't expect you to go through every page, but here you are. Either you're genuinely curious about what's written here, or you have way too much free time. Bintahi, I'll let you decide which one it is.\n\nAnyway, thanks for taking the time to read this far. I know this notebook is still a work in progress, so there's probably more waiting for you later. For now, you can take a break. You've earned it.\n\nCongratulations again. You've unlocked absolutely nothing, except bragging rights and the knowledge that your friend spends a questionable amount of time making websites for you.",
    },
    {
      title: "You've Reached the End... For Now",
      body: "And that's the end of what's available for now. Before you ask, no, the notebook isn't finished yet. I'm still working on it, and I honestly don't know when I'll be done adding everything I have in mind.\n\nThere are still stories I haven't written, memories I haven't turned into words, and random ideas that haven't made it onto these pages. Some might show up soon, others might take a while. Depends on how cooperative my brain decides to be. Bintahi.\n\nFor now, this is where the reading stops. There's no next chapter available yet, so don't go looking for a hidden page or some secret ending.\n\nThanks for reading everything that's here so far. The notebook may be on pause, but the project isn't finished. When there's something new, there'll be another chapter waiting for you.\n\nUntil then, this is the end... for now.",
    },
    {
      title: "",
      body: "",
    }
  ];

  // The published read-only version uses these notes.
  // It deliberately does not load or save notes from localStorage.
  const data = {
    notes: starterNotes,
    from: "Your bestie"
  };

  let current = -1; // -1 = cover, -2 = contents, 0+ = note
  let turning = false;
  let turnTimer = null;

  const page = document.getElementById("page");
  const pageContent = document.getElementById("pageContent");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const progress = document.getElementById("progress");
  const contentsBtn = document.getElementById("contentsBtn");

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function renderCover() {
    pageContent.innerHTML = `
      <div class="page-top">
        <span class="page-label">A little something for you</span>
        <span class="page-number">♡</span>
      </div>

      <div class="cover-content">
        <div class="cover-mark">for you</div>
        <h2>A Little<br>Notebook</h2>
        <p class="cover-subtitle">
          Little reminders, random thoughts, and words
          I wanted you to have somewhere.
        </p>
        <div class="cover-from">from, ${escapeHTML(data.from)}</div>
      </div>

      <div class="page-bottom">
        <span>Open whenever you need it.</span>
        <span>♡</span>
      </div>
    `;

    progress.textContent = "Cover";
    prevBtn.disabled = true;
    nextBtn.disabled = false;
    nextBtn.textContent = "Open notebook →";
  }

  function renderNote() {
    const note = data.notes[current];

    if (!note) {
      current = -1;
      renderCover();
      return;
    }

    pageContent.innerHTML = `
      <div class="page-top">
        <span class="page-label">A note for you</span>
        <span class="page-number">${current + 1}</span>
      </div>

      <h2 class="note-title">${escapeHTML(note.title)}</h2>

      <div class="note-body"
           id="noteBody"
           role="document"
           aria-label="${escapeHTML(note.title || "Notebook note")}">${escapeHTML(note.body)}</div>

      <div class="page-bottom">
        <span>Written with care.</span>
        <span>Page ${current + 1}</span>
      </div>
    `;

    progress.textContent = `Page ${current + 1} of ${data.notes.length}`;
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    nextBtn.textContent = current === data.notes.length - 1
      ? "Back to cover ↶"
      : "Next page →";
  }

  function renderContents() {
    pageContent.innerHTML = `
      <div class="page-top">
        <span class="page-label">Find a page</span>
        <span class="page-number">Index</span>
      </div>

      <h2 style="font-family:Caveat,cursive;font-size:34px;margin:0 0 16px">
        Little chapters
      </h2>

      <div id="contentsList" style="display:grid;gap:10px"></div>

      <div class="page-bottom" style="margin-top:auto">
        <span>Every page has its place.</span>
        <span>♡</span>
      </div>
    `;

    const list = document.getElementById("contentsList");

    data.notes.forEach((note, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "btn";
      button.style.textAlign = "left";
      button.textContent =
        `${String(index + 1).padStart(2, "0")}  ·  ${note.title || "Untitled note"}`;

      button.addEventListener("click", () => {
        if (turning) return;
        current = index;
        render();
      });

      list.appendChild(button);
    });

    progress.textContent = "Contents";
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    nextBtn.textContent = "Back to cover ↶";
  }

  function render() {
    if (current === -1) {
      renderCover();
    } else if (current === -2) {
      renderContents();
    } else {
      renderNote();
    }
  }

  function navigate(direction) {
    if (turning) return;

    if (current === -2) {
      current = -1;
      render();
      return;
    }

    turning = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    contentsBtn.disabled = true;

    page.classList.remove("turn-next", "turn-prev");
    void page.offsetWidth;
    page.classList.add(direction > 0 ? "turn-next" : "turn-prev");

    turnTimer = window.setTimeout(() => {
      if (direction > 0) {
        if (current === -1) {
          current = data.notes.length ? 0 : -1;
        } else if (current < data.notes.length - 1) {
          current++;
        } else {
          current = -1;
        }
      } else {
        if (current === -1) {
          current = data.notes.length ? data.notes.length - 1 : -1;
        } else if (current > 0) {
          current--;
        } else {
          current = -1;
        }
      }

      page.classList.remove("turn-next", "turn-prev");
      render();

      turning = false;
      contentsBtn.disabled = false;
      turnTimer = null;
    }, 480);
  }

  prevBtn.addEventListener("click", () => navigate(-1));
  nextBtn.addEventListener("click", () => navigate(1));

  contentsBtn.addEventListener("click", () => {
    if (turning) return;
    current = -2;
    render();
  });

  // Allow left/right arrow navigation without enabling editing.
  document.addEventListener("keydown", event => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      navigate(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigate(-1);
    }
  });

  render();
})();
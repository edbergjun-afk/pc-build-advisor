# Reflection: PC Build Advisor

**Live app:** https://pc-build-advisor-eta.vercel.app/ · **Repo:** https://github.com/edbergjun-afk/pc-build-advisor

## What I built and why
I built an AI advisor for an online computer store. A customer gives a budget in PHP and a main use, and gets a complete desktop build from the store's own catalogue. I picked this problem because choosing PC parts is confusing for first-time buyers. Sockets, DDR4 versus DDR5, case sizes and power supply ratings are easy to get wrong, and the mistakes cost money.

My first idea was a simple chatbot. While validating it, I realised that would be exactly the "generic chatbot wrapper" the brief warns against: a general AI can recommend parts that don't exist, aren't in stock, or don't fit together. So I made the differentiator the core of the design. The AI handles the conversation and the trade-offs. It can only pick parts through a catalogue search tool, and every build must pass a deterministic rule engine (socket, memory, form factor, GPU length, cooler, M.2 slots, PSU load, budget) before the customer sees it.

## What was hard
**My environment.** My work laptop blocks Node.js from reaching the internet, so I could not install packages or run the app locally. Instead of stopping, I used GitHub Actions as my build and test machine. Every push ran lint, type checks, unit tests and a production build. The first CI run passed everything except one of 19 tests, and that failure was a mistake in the test, not the app.

**Deployment.** My first attempt at setting environment variables in Vercel failed because I put the key in the name field. After deploying, the chat only said "the AI service had a problem". I added short error codes and a health check flag. These showed `AI-401` and that `OPENAI_BASE_URL` was missing, so my course key was being sent to the wrong endpoint. Lesson: build in ways to diagnose problems before you need them.

**The model's behaviour.** Live testing found problems no unit test would have. The model left PHP 10,500 of a PHP 40,000 gaming budget unspent, ignored a power supply warning, used markdown I had told it not to, and once used all its steps on searches without writing a reply. I fixed these mostly in code, not in the prompt: an `underused_budget` rule with a test, a higher step limit, and safer rendering. Each fix is recorded in the spec's revision history.

## How I used AI tools
I used an AI coding assistant (Claude Code) for most of the code, tests and first drafts of the documents. My role was choosing the problem and user, making the design decisions, setting up GitHub, Vercel and the environment variables, testing the live app, and deciding what to fix. The assistant made mistakes too, like the faulty test and step limits that were too low. CI and live testing caught them, not reading the code. I also learned a security lesson: I pasted my API key into the chat, which meant treating it as exposed and rotating it.

## User feedback
**TODO:** summarise your 3 to 5 user tests or interviews here: who you asked, what they liked, what confused them, and what you changed.

## Limitations and v2
The catalogue and prices are sample data, the power and size rules are simplified, and the rate limit only works per server instance. The model also sometimes favours the CPU over the graphics card for gaming. For v2 ([issue #1](https://github.com/edbergjun-afk/pc-build-advisor/issues/1)) I would move the catalogue into Supabase with live stock and prices, add shareable build links, and hand builds off to a cart.

## Key lesson
Use the language model for what it is good at, understanding people and explaining trade-offs, and put anything that must be correct into tested code. And deploy early: the most important bugs only appeared once real requests hit the live app.

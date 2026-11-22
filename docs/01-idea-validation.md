# Idea validation: PC Build Advisor


## Step 1: Problem statement

Customers shopping at an online computer store who want a custom desktop PC must choose about eight interdependent parts (CPU, motherboard, memory, graphics card, storage, power supply, case, cooler). Mistakes are common and expensive: a CPU that does not fit the motherboard socket, DDR4 memory on a DDR5 board, a graphics card too long for the case, or an undersized power supply. Customers also struggle to split a fixed budget sensibly for their use case (gaming vs editing vs office).

## Step 2: Specific user

**Primary user:** a first-time or occasional PC builder in the Philippines with a fixed budget (roughly PHP 25,000 to PHP 100,000) who knows what they want to *do* with the PC but not which parts to buy. Typical examples: a student who wants a 1080p gaming PC, or a small-business owner who needs a reliable office PC.

**Secondary user:** the store itself, which wants fewer wrong-part returns and fewer repetitive "what should I buy for PHP 40k?" chat enquiries.

## Step 3: Evidence the problem exists

- **TODO (interviews):** talk to 3 to 5 people who have bought or plan to buy a PC. Ask: *How did you choose your parts? What was confusing? Did anything not fit or need returning?* Record short anonymised quotes here.
- **TODO (desk research):** find 2 or 3 public examples, such as forum threads or Facebook PC-building group posts asking "is this build compatible?" or "best build for PHP X". Link them.
- **TODO (store angle, optional):** if you can, ask a store's chat agent how often they get build-advice enquiries.

## Step 4: Existing alternatives

| Alternative | What it does well | Gap for our user |
|---|---|---|
| PCPartPicker | Strong compatibility filtering across many retailers | User must already know which parts to pick. Not tied to one local store's stock or PHP prices. |
| General AI chatbots | Conversational, can explain trade-offs | Can suggest parts that do not exist, are not in stock, or do not fit together. Prices are guesses. |
| Asking store staff or forums | Human judgement | Slow, only during business hours, and answers vary in quality. |
| Pre-built PCs | No choosing needed | Less control over budget split. Often worse value for the use case. |

**TODO:** add any local store "PC builder" pages you find, and how they compare.

## Step 5: Differentiating angle

**An AI advisor that can only recommend parts the store actually sells, and whose every build is checked by deterministic code before the customer sees it.**

- The AI handles the conversation: it understands "1080p esports, quiet, PHP 40k" and makes trade-offs.
- Tool calls restrict choices to the store's catalogue (IDs and prices come from data, not the model).
- A rule engine checks socket, memory type, form factor, GPU length, cooler height and radiator fit, PSU wattage with headroom, and the total against the budget. If a check fails, the AI must fix the build.
- The result is shown as a clear checked build panel, not just chat text.

## Step 6: Feasibility

- **Tech:** Next.js, the Vercel AI SDK with tool calling, and an OpenAI-compatible model. A sample catalogue of about 45 parts is enough to demonstrate it.
- **Cost:** small model (gpt-4o-mini class) with a few tool calls per build. Free hosting tier on Vercel.
- **Risks:** model ignores the tools (mitigated by the system prompt plus the server-side check), stale prices (out of scope: sample data), abuse of the API key (mitigated by rate limiting and server-only key).
- **Time:** fits in one week as a mini-project.

## Step 7: Success metrics and validation test

- **Leading metric:** at least 90% of suggested builds pass the compatibility check on the first or second evaluation (from `build_evaluated` logs).
- **User test (TODO):** ask 3 people to use the live app with their own budget. Record: did they get a build in under 2 minutes? Would they trust it enough to buy (1 to 5)? What confused them?
- **Business proxy (v2):** "add build to cart" click-through, and return rate for wrong parts.

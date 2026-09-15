# If & When Railway Rescue

A single Primary 3 English game based on Grammar LS8.5 and the world of *Prince Zak and the Wise Frog*.

## Game structure

- Questions 1–10: pupils type a complete sentence combining two ideas with the required **if** or **when**.
- Questions 11–15: pupils type a complete sentence using the given stem and bracketed words.
- Part 1: Palace Garden Rails.
- Part 2: Pond Bridge Express.
- Part 3: Moonlit Mountain Line.

Pupils choose Wise Frog, Princess or Prince Zak. The princess has large round eyes and long lashes. Each part reveals a different railway scene, while the train and selected character visibly move towards that part's finish. Overall progress continues across all 15 questions.

## Marking

Answers must preserve the intended condition or event sequence. For Questions 1–10, the condition or earlier event always remains the first source idea, even when the clauses are rearranged. Reversals that change meaning are rejected.

The checker separately flags:

- meaning or sequence reversals;
- missing or incorrect words;
- likely spelling mistakes;
- missing capital letters;
- missing or misplaced commas;
- missing final punctuation;
- grammar errors outside the approved answer patterns.

An opening if/when-clause requires a comma. A final if/when-clause does not. Q11 is explicitly tested against reversed, ungrammatical and incorrectly punctuated answers.

Hints ask pupils to identify the condition or the earlier event. A correct model is available after an incorrect attempt, but pupils must still type a correct answer to move on. First answers remain separate from retries, hints and model answers. Three independent correct answers earn a life; zero lives becomes continued practice.

## Sound and results

The optional looping music is generated in the browser as a short 2D arcade-style chiptune. It begins only after the pupil turns it on. No old music file is loaded.

At the finish, pupils can show the teacher the independent score and item review, download a CSV, or print the results. Results remain on the device and are not submitted automatically.

## Verification

Run `node tests/engine.cjs`. Browser checks should cover all 15 accepted answers, wrong sequence, punctuation, spelling, hints, retries, part transitions, all three characters, sound toggle, saved progress, results, and iPad portrait and landscape layouts.

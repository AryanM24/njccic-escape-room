# Protocol: Nightjar

### Student briefing. No spoilers. Read this, or don't — the console will tell you most of it anyway.

---

## Where you are

**Meridian Grid Authority** is a regional power utility. It moves electricity to about
a quarter of a million homes. It has 1,400 staff, a building with badge readers on the
doors, and two computer networks that are supposed to never touch each other:

- the **corporate** network, where people read email and complain about the printer
- the **control** network, where the relay controllers that actually open and close
  breakers live

You are the overnight SOC analyst. SOC means Security Operations Centre. It is 22:00 on
a Tuesday, you are the only person on site who does your job, and the shift is normally
quiet.

## What happens

At **02:15** the operations console locks its operators out and prints a warning.

Somebody has scheduled a **load-shedding cascade for 03:00**. That means four sectors
of the grid drop offline on a timer. 240,000 meters. Hospitals have generators. Most
things do not.

Whoever did it leaves you a message. He calls himself **NIGHTJAR**, and he is not
mysterious about it: he used to work here, his contract ended in August, and he says
that nothing he was given access to was ever taken away. He did not break in. He walked
in, sat down at a desk that still has his name on it, and used permissions somebody
signed off on.

You have **45 minutes**.

## Why you cannot just press the abort button

You can. It exists. It works.

It is behind **OT-REC-1**, which is a recovery procedure somebody at Meridian wrote
after the *last* incident, when a panicking operator hit the wrong abort and dropped a
sector that did not need dropping. The rule they wrote says: before an emergency abort
is authorised, an analyst must file an incident finding for every subsystem the
intrusion touched, and the console checks each finding against what the logs actually
say.

There are **five findings** tonight.

So the thing standing between you and the off switch is not a hacker and not a
firewall. It is a form, written by a committee, that will not accept a wrong answer.
NIGHTJAR knows this. It is part of why he picked tonight.

Once the cascade is stopped there is one more field on the form, because containment
and attribution are different jobs: **who did this.** Four people had some kind of
access tonight. Only one of them is NIGHTJAR.

## How to play

Everything happens in the terminal. Type commands, read what comes back, think, submit
a finding.

Three things and then stop reading:

```
help            every command, grouped
briefing        your shift notes
locks           what the console is still waiting on
```

When you have an answer:

```
unlock <id> <answer>
```

And when you are stuck:

```
hint <id>
```

**Hints are free.** There are three per finding, they get more specific, and nothing is
scored. Being stuck for ten minutes teaches you nothing, so spend them.

## Things that are true and worth knowing

- **Every tool you need is already in the terminal.** You do not need Google, a
  calculator, or anything installed. `man <command>` explains what a command does *and*
  the security idea behind it.
- **Read the man pages.** Genuinely. They are short and at least one of them tells you
  how to solve a finding.
- **Nothing is hidden in a clever place.** No pixel hunting, no guessing passwords, no
  trivia. Every answer is sitting in a file or a log that you are allowed to read. The
  work is noticing which part of it matters.
- **Wrong answers cost nothing** except the few seconds it takes to type another one.
  There is a limit on how fast you can guess, which exists to tell you that guessing is
  not the intended route.
- **You cannot break it.** The filesystem is read-only. Refreshing the page does not
  lose your progress.
- **`effects off`** turns off the scanlines and the flicker if they bother you.

## A hint about hints

The findings are not riddles. They are the same kind of question a real analyst answers
on a real bad night:

> Which of these five emails is lying about who sent it?
>
> This log has forty rows. One of them is an attack. Which one, and how do you know?
>
> What does normal look like here, and what does today look like?

If you find yourself trying to be clever, stop and read the evidence again. It is
always in the evidence.

---

*Everything in this scenario is fictional. The company, the people, the addresses and
the domains are all invented, and none of them resolve to anything real.*

*Made by Team 10 of the Advanced Interns at NJCCIC.*

# Boss Skill Logger

Logger for enemy skill IDs (aka Actions). 

### Chat commands:
* **!bosslog** - Toggles on/off

### Info
* Outputs enemy skill IDs to party chat (client-side, only you see them).
* Setting the variable "writeLog" to true will create a log file that is more detailed than the output in chat.
* Some skills have multiple stages, but this script only records the first stage. Look inside the S_ACTION_STAGE event to change this behaviour.
* If a boss spawns adds during the fight, their action IDs will also be output. Uncomment bossId conditions to ignore the adds if desired.

### How to use:
1. Enable the module via chat command when you are about to meet and start boss fight. 
2. Video record yourself fighting the boss (Obs or whatever). 
3. Review the recording and look at the chat to match boss action id to boss animation.

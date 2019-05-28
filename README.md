# Boss Skill Logger

Logger for enemy skill IDs (aka Actions). 

### Chat commands:
* **bsl** - Toggles on/off

### Info
* Outputs enemy skill IDs to proxy chat (client-side, only you see them).
* Setting the variable "writeLog" to true in config will create a log file that is more detailed than the output in chat inside "boss_logs" subfolder in the modules directory (enabled by defafult)
* Some skills have multiple stages, but this script only records the initial stage. Look inside the S_ACTION_STAGE event to change this behaviour. (usually unneccessary)
* If a boss spawns adds during the fight, their action IDs will not be outputted. (see S_ACTION_STAGE again)

### How to use:
1. Enable the module via chat command before you enter the dungeon with the boss. 
2. Video record yourself fighting the boss (Obs or whatever). (or just pay attention or write something to chat to mark important moments)
3. Review the recording and look at the chat to match boss action id to boss animation. (or just pay attention)

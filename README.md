# GoodmatchV2
Derivco Assignment
 
 Run 'npm i' to install dependencies
 Run 'node goodmatch.js' or 'npm start' to run the program
 
 The program will ask you whether you would like to run the program with given inputs in the console or using a .csv file.
 You will need to input 2 names in the case of the console or a filename with the .csv extension.
 You will find the given output for the csv file option in 'output.txt'
 
 Please note the following:
 Format for the csv files should be in the format 'name, [m/f]' on each individual line (there are no numbers on each line)
 There is a debugging log in 'debug.txt'

## Update:
The following project is an update of https://github.com/rcleong194/GoodMatch. 
The following overall changes have been made:
- Split the code into various classes
  - Matcher class deals with the logic and compatability of various players
  - Printer class deals with giving an output based off what the Matcher class gives it
- Small code changes in regards to making some of the code more scalable (e.g. allowing an array of names as an input instead of 2 names).
- Various format changes for consistency

'use strict';
var readlineSync = require('readline-sync');
var parser = require('csv-parse/lib/sync');

var fs = require('fs');

if (!fs.existsSync('debug.txt')) {
    fs.writeFileSync('debug.txt','');
}

/**
 * Matches class
 * Holds all the logic in regards to seeing compatability score 
 */
class Matcher{
    characterCounter(s) {
        let numArray = [];
        while (s.length > 0) {
            let counter = 0;
            for (let j = 0; j < s.length; j++) {
                
                if (s[0] == s[j]) {
                    counter++;
                }
            }
            let reg = new RegExp(s[0], 'g');
            s = s.replace(reg, '');
            numArray.push(counter);
        }
        return numArray;
    }

    numCheck(s) {
        for (let i = 0; i < s.length; i++) {
            if (s[i].match(/[A-Z|a-z]/i) == null) {
                console.log("Names can only be letters");
                fs.appendFileSync("debug.txt", new Date() + ": An incorrect name was given '" + s +"' \n");
                process.exit();
            }
        }
    }

    splitNumArray(numArray) {
        let string = '';
        for (let i = 0; i < numArray.length; i++) {
            string += numArray[i];
        }
        let splitArr = string.split("");
        return splitArr.map(x => parseFloat(x));
    }

    getCompatablity(numArray) {
        let workingArray = [];
        numArray = this.splitNumArray(numArray);
        if (numArray.length <= 2)
            return numArray;

        while (numArray.length > 0) {
            let num1 = numArray.shift();
            let num2 = numArray.pop() || 0;
            workingArray.push(num1 + num2);
        }
        return this.getCompatablity(workingArray);
    }

    getCompatabilityOf2Players(n1, n2) {
        let finalString = n1 + "matches" + n2;

        finalString = finalString.toLowerCase();
        finalString = finalString.replace(/\s+/g, '');
        let compatArray = this.getCompatablity(this.characterCounter(finalString));
        let compatString = '';
        for (let i = 0; i < compatArray.length; i++) {
            compatString += compatArray[i];
        }
        let retVal = parseFloat(compatString);
        return retVal;
    }
}

/**
 * Printer class
 * Outputs compatability ratings
 * Considering that various formats are needed as inputs, setters and getters should really only be set classes that inherit from the printer class.
 *      Small note on setters and getters: could be easily done but considering scope of current program, it is not necessary
 */
class Printer{
    constructor(){
        this.matcher = new Matcher();
    }

    print(){
        throw new Error("Method 'print()' must be implemented.");
    };
}

/**
 * Only prints to the console
 */
class ConsolePrinter extends Printer{
    constructor(names){
        super();
        this.names = names;
    }

    print() {
        let finalString = '';
        for(let i = 0; i< this.names.length; i++){
            this.matcher.numCheck(this.names[i]);
            if(i < this.names.length-1)
                finalString += this.names[i]+ "matches";
            else
                finalString += this.names[i];
        }

        finalString = finalString.toLowerCase();
        finalString = finalString.replace(/\s+/g, '');
        let compatArray = this.matcher.getCompatablity(this.matcher.characterCounter(finalString));
        let compatString = '';
        for (let i = 0; i < compatArray.length; i++) {
            compatString += compatArray[i];
        }
        let strValue = '';
        for(let i = 0; i< this.names.length; i++){
            if(i < this.names.length-1)
                strValue += this.names[i] + " matches ";
            else
                strValue += this.names[i];
        }
        let retVal = parseFloat(compatString) > 80 ? strValue + ' ' + compatString + '%, good match' : strValue + ' '+ compatString + '%';
        return retVal;
    }    
}

/**
 * Prints to a file 'output.txt'
 * Does have small helper functions for the print function
 * Small note that it does do some debugging in regards to the parsed csv entered into it 
 */
class CsvPrinter extends Printer{

    constructor(csv){
        super();
        this.csv = parser(csv, {
            rows: true,
            skip_empty_lines: true
        })
    }

    toTextFile(arr) {
        let retArray =[]
        for (let i = 0; i < arr.length; i++)
            retArray.push(arr[i][0] > 80 ? arr[i][1] + ' matches ' + arr[i][2] + ' ' + arr[i][0] + '%, good match' : arr[i][1] + ' matches ' + arr[i][2] + ' ' + arr[i][0] + '%');
        return retArray;
    }

    removeDuplicatesAndSort(arr) {
        return [...new Set(arr)].sort();
    }

    print() {
        let data = this.csv;
        let males = [];
        let females = [];
        let pairResults = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i].length > 2) {
                console.log("Only input the name and gender separated by a comma (E.g. John, m)");
                fs.appendFileSync("debug.txt", new Date() + ": Formatting error in .csv file (should only be in format 'name, [m/f]' != "+ data[i] +"\n");
                process.exit();
            }
            this.matcher.numCheck(data[i][0]);
            let gender = data[i][1].replace(/\s+/g, '');
            switch (gender) {
                case 'f':
                    females.push(data[i][0]);
                    break;
                case 'm':
                    males.push(data[i][0]);
                    break;
                default:
                    console.log("Gender must be 'f' or 'm'");
                    fs.appendFileSync("debug.txt", new Date() + ": Gender must be 'f' or 'm' \n");
                    process.exit();
                    break;
            }
        }
        males = this.removeDuplicatesAndSort(males);
        females = this.removeDuplicatesAndSort(females);
        for (let i = 0; i < males.length; i++) {
            for (let j = 0; j < females.length; j++) {
                let compat = this.matcher.getCompatabilityOf2Players(males[i], females[j]);
                pairResults.push([compat,males[i], females[j]])
            }
        }
        pairResults = pairResults.sort(function (a, b) { return b[0] - a[0]; });
        let txt = this.toTextFile(pairResults);
        var file = fs.createWriteStream('output.txt');

        txt.forEach(function (v) { file.write(v + '\n'); });
        file.end();
        //return [males, females];
        return "Results are in 'output.txt'"
    }
}

/**
 * Essentially same code as last time
 * Updated for scalability if more/different inputs are required 
 */
let conOrcsv = readlineSync.question("Would you like to use the console or input .csv file? (con/csv)");
let printer;
const maxNamesConsole = 2;
switch(conOrcsv) {
    case 'con': 
        let names = [];
        for(let i = 0; i < maxNamesConsole;i++){
            names[i] = readlineSync.question("Input name "+ (i+1) +": ");
        }
        printer = new ConsolePrinter(names);
        break;
    case 'csv':
        try {
            let fileName = readlineSync.question("Full file name (E.g. foo.csv)");
            const fileData = fs.readFileSync('./' + fileName, { encoding: 'utf8', flag: 'r' });
            printer = new CsvPrinter(fileData);
        } catch {
            console.log("File does not exist or there are formatting errors in the file");
            fs.appendFileSync("debug.txt", new Date() + ": Given file name does not exist. If file does exist check formatting of items \n");
            process.exit();
        }
        break;
    default:
        console.log("Please only put 'con' or 'csv'");
        fs.appendFileSync("debug.txt", new Date() + ": Incorrect input, expected 'con' or 'csv' \n");
        process.exit();
        break
}

console.log(printer.print());
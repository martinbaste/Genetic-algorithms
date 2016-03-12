VALID = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "+", "-", "*", "/", "@"]


//Reproduce!

function recombine(gen1, gen2) {
    var loc = Math.floor(Math.random() * gen1.length);
    var nGen1 = gen1.slice(0,loc) + gen2.slice(loc);
    var nGen2 = gen2.slice(0,loc) + gen1.slice(loc);
    return [nGen1, nGen2]
}

//mutate

function mutate(gen) {
    var newLetter = VALID[Math.floor(Math.random() * VALID.length)];
    var loc = Math.floor(Math.random() * gen.length);
    gen = gen.slice(0,loc) + newLetter + gen.slice(loc+1);
    return gen
}

//Fitness and stuff


function fitness(value) {
    if (value == 42) {return 1};
    return Math.round(1/Math.pow((42-value),2)*1000)/1000
}

function compare(a,b) {
    if (a[2] < b[2]) {
        return 1
    } else if (a[2] > b[2]) {
        return -1
    } else {
        return 0
    }
}
        
//Genotype to Phenotype

function operation(operator, value1, value2) {
    operations = {
        '+': function(x1,x2) {
            return x1 + x2;
        },
        '-': function(x1,x2) {
            return x1 - x2;
        },
        '*': function(x1,x2) {
            return x1 * x2;
        },
        '/': function(x1,x2) {
            if (x2 == 0) {return 0} 
            return x1 / x2;
        }
    }
    return operations[operator](value1,value2)
}


function operate(genotype, i) {
    if (i == undefined || i < 1) {i = 1};
    var value1 = genotype[genotype.length-i];
    var value2 = genotype[genotype.length-(i+1)];
    if (value1 == '@') {return 0}
    if (value2 == '@') {
        if (isNaN(value1)) {
                return 0
            }
            return value1
        }
            
    if (genotype[genotype.length-(i+2)] == '@' || genotype.length < 3 || genotype[genotype.length-(i+2)] == undefined) {
        var result = genotype[genotype.length-(i+1)];
        if (!isNaN(result)) {
            return parseFloat(result);
        } else {
            return 0
        }
    }
    if (isNaN(genotype[genotype.length-(i+2)]) && !isNaN(value2) && !isNaN(value1)) {
        value1 = parseFloat(value1);
        value2 = parseFloat(value2);
        genotype.splice(genotype.length-(i+2),3,operation(genotype[genotype.length-(i+2)], value2, value1));
        return operate(genotype, i-1)
    } else {
        return operate(genotype, i+1)
    }
}


function express(genotype) {
    return operate(genotype.split(''));
}


//Random individual & population

function genRInd (genLength) {
    var genotype = '';
    for (var i = 0; i < genLength; i++) {
        genotype += VALID[Math.floor(Math.random() * VALID.length)];
    }
    return genotype
}

function genRPop(size, genLength) {
    var population = [];
    for (var i = 0; i < size; i++) { 
        population.push([i,genRInd(genLength), 0] );
    }
    return population
}


//Main

function main () {
    var size = 100;
    var genLength = 40
    var population = genRPop(size, genLength);
    var remove = 2;
    var generations = 1000;
    var mutRate = 0.04
    var bestFitness = [];
    var generationCount = []; //For plotting purposes
    var idCount = size;
    for (var gen = 0; gen < generations; gen++) {
        generationCount.push(gen);
        // Score them
        for (var i = 0; i < population.length; i++) {
            population[i][2] = fitness(express(population[i][1]));
        }
        
            
        //Sort them
        
        population = population.sort(compare);
        
        bestFitness.push(population[0][2]);
        
        //Reproduce!
        
        population = population.slice(0, size-remove);
        var elite = population.slice(0, remove/2);
        for (var i = 0; i <= remove; i++) {
            var ind1 = elite[Math.floor(Math.random() * elite.length)];
            var ind2 = elite[Math.floor(Math.random() * elite.length)];
            idCount += 1;
            var newInd = [idCount, recombine(ind1[1],ind2[1])[Math.floor(Math.random() * 2)],0];
            population.push(newInd);
        }
        
        //mutate
        
        for (var i = 0; i < size*genLength*mutRate; i++) {
            var ind = Math.floor(Math.random() * population.length)
            population[ind][1] = mutate(population[ind][1]);
        }
        
        
    }
    var trace1 = {
        x: generationCount,
        y: bestFitness,
        type: 'scatter'
    };
    var data = [trace1];
    Plotly.newPlot('myDiv', data);
    console.log(population[0])
}


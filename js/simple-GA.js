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


function fitness(value, tNumber) {
    return Math.pow(tNumber-value,2);
}

function compare(a,b) {
    return a[3] - b[3]
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
            return parseFloat(value1);
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
        population.push([i,genRInd(genLength), 0,0] );
    }
    return population
}

//Statistics

function diversityInd(gen1,gen2) {
    var d = 0;
    for (var i = 0; i < gen1.length; i++) {
        if (gen1[i] != gen2[i]) {
            d += 1;
        }
    }
    return d/gen1.length;
}

//Main


function main (size, generations, tNumber) {
    var size = parseInt(size);
    var generations = parseInt(generations);
    var tNumber = parseInt(tNumber);
    var genLength = 10
    population = genRPop(size, genLength);
    var remove = Math.floor(size*0.2);
    var mutRate = 0.04
    var avFitness = [];
    var diversity = [];
    bestFitness = [];
    popList = [];
    var generationCount = []; //For plotting purposes
    var idCount = size;
    for (var gen = 0; gen < generations; gen++) {
        
        if (gen != 0) {
            
            
        
            //Reproduce!

            population = population.slice(0, size-remove);
            var elite = population.slice(0, remove/2);
            for (var i = 0; i <= remove; i++) {
                var ind1 = elite[Math.floor(Math.random() * elite.length)];
                var ind2 = elite[Math.floor(Math.random() * elite.length)];
                idCount += 1;
                var newInd = [idCount, recombine(ind1[1],ind2[1])[Math.floor(Math.random() * 2)],0,0];
                population.push(newInd);
            }

            //mutate

            for (var i = 0; i < (size-(remove/2))*genLength*mutRate; i++) {
                var ind = Math.floor(Math.random() * (population.length-(remove/2)))
                population[ind][1] = mutate(population[ind+(remove/2)][1]);
            }
        }
        
        generationCount.push(gen);
        // Score them
        var accFit = 0;
        for (var i = 0; i < population.length; i++) {
            var ex = express(population[i][1]);
            population[i][2] = ex;
            population[i][3] = fitness(ex, tNumber);
            accFit += population[i][3];
        }
        
        avFitness.push(accFit/size);
            
        //Sort them
        
        
        
    
        
        //Get Statistics
        population = population.sort(compare);
        popList.push($.extend(true, [], population));
        //bestFitness.push(population[0][3]);
        //console.log(gen, population[0])
        var accDiv = 0;
        var comparisons = 100;
        for (var i = 0; i < comparisons; i++) {
            var ind1 = population[Math.floor(Math.random() * population.length)];
            var ind2 = population[Math.floor(Math.random() * population.length)];
            accDiv += diversityInd(ind1[1],ind2[1]);
        }
        diversity.push(accDiv/comparisons);
        
        bestFitness.push(population[0].slice(3)[0]);
        
        

        
        
    }
    for (var gen = 0; gen < generations; gen++) {
        bestFitness.push(popList[gen][0][3]);
    }
    var trace1 = {
        x: generationCount,
        y: bestFitness,
        type: 'scatter'
    };
    var trace2 = {
        x: generationCount,
        y: avFitness,
        type: 'scatter'
    };
    var trace3 = {
        x: generationCount,
        y: diversity,
        type: 'scatter'
    }
    var data = [trace1, trace2, trace3];
    var data = [trace1];
    Plotly.newPlot('myDiv', data);
    drawTable(popList[popList.length-1]);
}


function drawTable (population) {
    var HTML = '<tr><th>#</th><th>Value</th><th>Fitness<th><th>Gene<th><tr>';
    for (var i = 0; i < population.length; i++) {
        HTML += '<tr><td>' + population[i][0] + '</td><td>' + population[i][2] + '</td><td>' + population[i][3] + '</td><td>' + population[i][1] + '</td></tr>';
    }
    document.getElementById('pop').innerHTML = HTML;
}


$( document ).ready(function() {
    $('#sim').click(function(e){
        e.preventDefault();
        var nGen = $('#nGen').val();
        var pop = $('#popSize').val();
        var num = $('#tNumber').val();
        main(pop, nGen, num);
    })
});
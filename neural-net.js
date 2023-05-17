import fs from 'fs';
import * as math from 'mathjs';
import sqlite3 from 'sqlite3';
import readline from 'readline';

class NeuralNetwork {
  constructor(networkStruct, learningRate) {
    this.networkStruct = networkStruct;
    this.learningRate = learningRate;
    this.network = this.initializeNetwork();
  }
     
  initializeNetwork() {
    // nested array of neuron objects
    let network = [];
    // i = 1 skip first layer
    for (let i = 1; i < this.networkStruct.length; i++) {
      // create layers
      let layer = [];
      for (let j = 0; j < this.networkStruct[i]; j++) {
        let neuron = {
          // create an array of weights given the number of neurons in the last layer using + 1 adds a bias
          weights: Array.from({ length: this.networkStruct[i - 1] + 1 }, () => {
            // randomize weights, look to improve this further with Xavier/Glorot, He initialization, Orthogonal initialization, Sparse initialization
            // Xavier/Glorot: Math.random() * Math.sqrt(2 / (this.networkStruct[i - 1] + this.networkStruct[i]));
            // He Initialization: so far provides lowest average
            return Math.random() * Math.sqrt(2 / this.networkStruct[i - 1]);
            // However, random has given lowest amount of epochs at 430 but it's inconsistent
            //return Math.random();
          })
        };
        layer.push(neuron);
      }
      network.push(layer);
    }
    return network;
  }
    
  activate(weights, inputs) {
    // initialize activation with bias
    let activation = weights[weights.length - 1];
    // iterate over the inputs and their corresponding weights multiplying them together
    for (let i = 0; i < weights.length - 1; i++) 
    {
          activation += weights[i] * inputs[i];
    }
    return activation;
  }

  transfer(activation) {
    // sigmoidal activation function returning value from 0 - 1
    return 1.0 / (1.0 + Math.exp(-activation));
  }

  forwardPropagate(inputs) {
    let currentInputs = inputs;
    // for each neuron calculate the activation and then apply the sigmodial transfer
    for (const layer of this.network) {
      let newInputs = [];
      for (const neuron of layer) {
        // multiply input by corresponding weight
        const activation = this.activate(neuron.weights, currentInputs);
        // sigmodial function
        neuron.output = this.transfer(activation);
        // new output
        newInputs.push(neuron.output);
      }
      currentInputs = newInputs;
    }
    return currentInputs;
  }

  transferDerivative(output) {
    // sigmodial derivative used for back propagation
    return output * (1 - output);
  }

  backwardPropagateError(expectedOutputs) {
    // iterate over layers in reverse order
    for (let i = this.network.length - 1; i >= 0; i--) {
      const layer = this.network[i];
      // initialize to handle multiple outputs
      let errors = [];
      // for the output layer
      if (i === this.network.length - 1) {
        for (let j = 0; j < layer.length; j++) {
          const neuron = layer[j];
          // calculate the error for each output neuron as the difference between the expected output and actual output
          errors.push(neuron.output - expectedOutputs[j]);
        }
      } else {
        // iterate through neurons in the current hidden layer
        for (let j = 0; j < layer.length; j++) {
          let error = 0;
          // iterate through neurons in the next layer
          for (const neuron of this.network[i + 1]) {
            // calculate the accumulated error for the current neuron by summing the product of the connecting neurons weight and its error
            error += neuron.weights[j] * neuron.delta;
          }
          errors.push(error);
        }
      }
      for (let j = 0; j < layer.length; j++) {
        const neuron = layer[j];
        // calculate the delta for the neuron using the derivative of the transfer function
        neuron.delta = errors[j] * this.transferDerivative(neuron.output);
      }
    }
  }

  updateWeights(inputs) {
    // iterate over layers
    for (let i = 0; i < this.network.length; i++) {
      let layerInputs;
      // if in first layer inputs equal features
      if(i == 0) {
        layerInputs = inputs;
      // otherwise they are outputs from the previous layer
      } else {
        layerInputs = this.network[i - 1].map(neuron => neuron.output);
      }
      // iterate over neurons in the current layer
      for (const neuron of this.network[i]) {
        for (let j = 0; j < layerInputs.length; j++) {
          // update neurons weight
          neuron.weights[j] -= this.learningRate * neuron.delta * layerInputs[j];
        }
        // update neurons bias weight
        neuron.weights[layerInputs.length] -= this.learningRate * neuron.delta;
      }
    }
  }

  train(dataset, nOutputs, nEpochs) {
    for (let epoch = 0; epoch < nEpochs; epoch++) {
      let sumError = 0;
      // iterate over the dataset
      for (const row of dataset){
        // split row into inputs (features) and expectedOutputs (labels)
        const inputs = row.slice(0, row.length - nOutputs);
        const expectedOutputs = row.slice(row.length - nOutputs);
        // forward propagate and get the outputs
        const outputs = this.forwardPropagate(inputs);
        // calculate the sum of squared errors between expected and actual outputs
        sumError += math.sum(math.map(math.subtract(expectedOutputs, outputs), x => x * x));
        // perform backward propagation to update the errors and deltas in the network
        this.backwardPropagateError(expectedOutputs);
        // update the weights in the network based on the errors and deltas
        this.updateWeights(inputs);
      }
      console.log(`> epoch=${epoch}, lrate=${this.learningRate}, error=${sumError}`);
      if (sumError < 0.01) {
        // stop training if sum of squared errors is less than 0.05 (for normal ai, 0.01 for generative ai)
        console.log('Converged to an error less than 0.01');
        return epoch+1;
      }else if (epoch === nEpochs - 1) {
        return nEpochs;
      }
    }
  }

  predict(inputs) {
    return this.forwardPropagate(inputs);
  }
}

// console input will be used later in update to allow user to enter netstruct/csv/lrate/nEpochs
function getInput(question){
  // create instance of Interface and take in an input stream
  const readline = require("readline");
  const console = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });  
  // wrap the question in a Promise
  return new Promise((resolve, reject) => {
    console.question(question, (input) => {
      if(input.trim() == ''){ 
        reject(new Error("no input")); 
      } else{
        resolve(input); 
      }
      console.close();
    });
  });
}

// csv input
async function readCSVFile(filePath) {
    const fileData = fs.readFileSync(filePath, 'utf8');
    const lines = fileData.split('\n').filter(line => line.trim() !== '');
    const features = lines.map((line) => line.split(',').map((value) => parseInt(value.trim())));
    return features;
}

// sqlite input
async function readSQLiteData(dbPath, targetLetter, letterPercentage, totalRows) {
  return new Promise(async (resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        reject(err);
      }
    });
    // select rows equal to our target letter
    const letterQuery = `SELECT * FROM dataset WHERE letter = ? ORDER BY RANDOM() LIMIT ?;`;
    // select randoms rows that aren't our target letter
    const otherQuery = `SELECT * FROM dataset WHERE letter != ? ORDER BY RANDOM() LIMIT ?;`;

    // set number of rows to grab for letter and other queries
    const letterLimit = Math.ceil(letterPercentage * totalRows); 
    const otherLimit = totalRows - letterLimit;

    try {
      // get letter data
      const letterRows = await new Promise((resolve, reject) => {
        db.all(letterQuery, [targetLetter, letterLimit], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });

      // get other data
      const otherRows = await new Promise((resolve, reject) => {
        db.all(otherQuery, [targetLetter, otherLimit], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        });
      });

      const allRows = letterRows.concat(otherRows);

      const features = allRows.map((row) => {
        // convert row into array
        const newRow = Object.values(row);
         // move first column to the end for expected output
        const letter = newRow.shift(); 
         // normalize the letter column
        newRow.push(letter === parseInt(targetLetter) ? 1 : 0);
        // normalize the remaining values excluding the last column
        for (let i = 0; i < newRow.length - 1; i++) {
          newRow[i] /= 255; 
        }
        // clean values turning them into numbers
        return newRow.filter((value) => value !== "").map(Number);
      });
      // all processed rows
      resolve(features);
    } catch (err) {
      reject(err);
    } finally {
      db.close();
    }
  });
}

function generateData(start, step, inputLength, rows) {
  let values = [];
  let val = [];
  for(let j = 0; j < rows; j++) {
    let val = [];
    let x = start + j * step;
    for(let i = start; i < inputLength + 1; i++) {
      // Create a new data point
      const datapoint = (Math.cos(x)+1) * 1/2;
      val.push(datapoint);
      x += step;
    }
    values.push(val);
  }
  //console.log(values);
  return values;
}

async function main() {
  try {   
    const networkStruct = [16, 4, 1]; // network structure [784, 50, 1] works!!!!!
    const learningRate = 0.7;
    const nEpochs = 5000;
    const filePath = 'data.csv';
    const dbPath = 'data/HandwrittenData.db';
    const letter = 2; // 0-25 for A-Z
    const letterPercentage = 0.2; // percentage of data that contains our selected letter
    const totalRows = 2500; // javascript heap runs out of memory around 8k - 10k rows
    //const dataset = await readSQLiteData(dbPath, letter, letterPercentage, totalRows);
    //const dataset = await readCSVFile(filePath);
    const step = 0.1;
    const start = 0;
    const inputLength = 16;
    const rows = 2000;
    const dataset = generateData(start, step, inputLength, rows);
    const neuralNetwork = new NeuralNetwork(networkStruct, learningRate);

    /*
    // split data into testing and training
    const splitRatio = 0.8;
    // separate letter and other rows
    const letterRows = dataset.filter(row => row[row.length - 1] === 1);
    const otherRows = dataset.filter(row => row[row.length - 1] === 0);

    // calculate the number of rows for each split
    const letterTrainSize = Math.floor(letterRows.length * splitRatio);
    const otherTrainSize = Math.floor(otherRows.length * splitRatio);

    // split the target letter and other letter datasets into train and test sets separately
    const letterTrainSet = letterRows.slice(0, letterTrainSize);
    const letterTestSet = letterRows.slice(letterTrainSize);
    const otherTrainSet = otherRows.slice(0, otherTrainSize);
    const otherTestSet = otherRows.slice(otherTrainSize);

    // concatenate the train and test sets for both target letter and other letters
    const trainSet = letterTrainSet.concat(otherTrainSet);
    const testSet = letterTestSet.concat(otherTestSet);
    */
    const epochs = neuralNetwork.train(dataset, networkStruct[networkStruct.length-1], nEpochs);
    const lettr = String.fromCharCode(letter + 65);
    let correctPredictions = 0;
    console.log('Testing the network...');
    /*for (let i = testSet.length - 1; i >= 0; i--) {
      const row = testSet[i];
      const inputs = row.slice(0, row.length - 1);
      const expectedOutput = row[row.length - 1];
      const output = neuralNetwork.predict(inputs)[0];
      // two answers 0.0-0.5 and 0.5-1.0
      const predicted = output >= 0.5 ? 1 : 0;
      if (predicted === expectedOutput) {
        correctPredictions++;
      }
      // USED TO SEE TESTING RESULTS
      //console.log(`For letter: ${lettr}, Expected: ${expectedOutput}, Got: ${output}`);
    }
    // calculate accuracy percentage
    const accuracy = (correctPredictions / testSet.length) * 100;
    //console.log(`Letter ${lettr}`);
    console.log(`Rows trained on: ${trainSet.length}`);
    console.log(`Rows tested on: ${testSet.length}`);
    console.log(`Total Epochs: ${epochs}`);
    console.log(`Accuracy: ${accuracy}%`);*/
    const row = dataset[0];
    let x = step*inputLength;
    for(let i = 0; i < 30; i++) {
      x += step;
      const inputs = row.slice(0, row.length - 1);
      const expectedOutput = row[row.length - 1];
      const output = neuralNetwork.predict(inputs)[0];
      row[row.length - 1] = output;
      row.shift();
      row.push((Math.cos(x)+1) * 1/2);
      let accuracy = expectedOutput - output;
      console.log(`given x: ${(x - step).toFixed(2)}, Expected: ${expectedOutput.toFixed(3)}, Got: ${output.toFixed(3)}, Error: ${accuracy.toFixed(4)}`);
    }
  } catch (error) {
        console.error('Error: ' + error.message);
        process.exit(1);
  }
}
  
main();
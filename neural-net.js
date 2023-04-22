const fs = require('fs');
const math = require('mathjs');

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
						// randomize weights
            			return Math.random() * Math.sqrt(2 / (this.networkStruct[i - 1] + this.networkStruct[i]));
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
			if (sumError < 0.05) {
				// stop training if sum of squared errors is less than 0.05
	  			console.log('Converged to an error less than 0.05');
	  			break;
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
			}
			else{
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

async function main() {
	try {
		// Either 4, 2, 1 or 4, 3, 1 and a lrate of 0.7 - 0.8 for best results. Current record 430 epochs
		// network structure
	  	const networkStruct = [4, 3, 1];
	  	const learningRate = 0.85;
	  	const nEpochs = 5000;
	  	const filePath = 'data.csv';
	  	const dataset = await readCSVFile(filePath);
  
	  	const neuralNetwork = new NeuralNetwork(networkStruct, learningRate);
	  	neuralNetwork.train(dataset, 1, nEpochs);
  
	  	console.log('Testing the network...');
	  	for (const row of dataset) {
			const inputs = row.slice(0, row.length - 1);
			const expectedOutput = row[row.length - 1];
			const output = neuralNetwork.predict(inputs)[0];
			console.log(`Input: ${inputs}, Expected: ${expectedOutput}, Got: ${output}`);
	  	}
	} catch (error) {
	  	console.error('Error: ' + error.message);
	  	process.exit(1);
	}
  }
  
  main();
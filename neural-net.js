class neuralNetwork{
	constructor(networkStruct, inputs){
		// initialize
		this.layers = networkStruct;
		this.inputs = inputs;
		this.net_struct = [];
		this.nodes = [];
		this.lastlayer = [];
		// create an array of integers
		const layerSizes = this.layers.split(",").map(size => parseInt(size.trim()));
		const features = this.inputs.split(",").map(size => parseInt(size.trim()));
		// check if number of inputs match input layer
		if(layerSizes[0] != features.length){
			throw new Error("input layer mismatch")
		}
		// compute neural net
		for(let i = 0; i < layerSizes.length; i++){
			// add a layer to the neural net 
			this.net_struct.push(this.nodes = Array(layerSizes[i]));
			for (let j = 0; j < this.nodes.length; j++){
				// fill input layer
				if(this.lastlayer.length == 0){
					this.nodes[j] = new node(this.lastlayer, features[j])
				}
				else{ // add collectors from connections
					this.sum = 0.0;
					for(let k = 0; k < this.lastlayer.length; k++){
						this.sum += this.lastlayer[k].collector;
					}
					// fill hidden and output layers
					this.nodes[j] = new node(this.lastlayer, this.sum)
				}
			}
			this.lastlayer = this.nodes;
		}
		// print neural net
		for(let i = 0; i < this.lastlayer.length; i++){
			console.log(this.lastlayer[i].collector)
		}
	}
}

class node{
	constructor(connections = [], collector){
		this.collector = collector;
		this.connections = connections;
	}
}

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

async function main(){
	try{
		const networkStruct = await getInput("Enter a list of numbers separated by a comma to represent the network structure\n");
		const inputs = await getInput("Enter a list of numbers separated by a comma for the features of this network\n");
		const n = new neuralNetwork(networkStruct, inputs)
	}
	catch(error) {
		console.error('Error: '+error.message);
		process.exit(1);
	}
}

main();

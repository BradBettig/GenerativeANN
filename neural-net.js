class neuralNetwork{
	constructor(networkStruct, inputs){
		this.layers = networkStruct;
		this.inputs = inputs;
		this.net_struct = [];
		this.nodes = [];
		this.lastlayer = [];
		// create an array of integers
		const layerSizes = this.layers.split(",").map(size => parseInt(size.trim()));
		const features = this.inputs.split(",").map(size => parseInt(size.trim()));

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
			resolve(input);
		  	console.close();
		});
	});
}

async function main(){
	const networkStruct = await getInput("Enter a list of numbers separated by a comma to represent the networks structure\n");
	const inputs = await getInput("Followed by a list of numbers to represent the features for this network (please match the appropriate number of features for the chosen structure)\n");
	const n = new neuralNetwork(networkStruct, inputs)
}

main();

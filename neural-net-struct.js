class neuralNet{
	constructor(layers, inputs) {

		this.layers = layers;
		this.inputs = inputs;
		this.net_struct = [];

		const layerSizes = layers.split(",").map(size => parseInt(size.trim()));
		
		for(let i = 0; i < layerSizes.length; i++){
			let nodes = [];
			this.net_struct.push(nodes = Array(layerSizes[i]));
			for (let j = 0; j < nodes.length; j++)
			{
				nodes[j] = new node();
			}

		}	
	}
}

class node{
	constructor(){
		this.collector = 0.0;
		this.collections = [];
	}
}
function main(){
	let myObject = new neuralNet("3,2,1", "1");
	let jsonString = JSON.stringify(myObject);
	console.log(jsonString);
}

main();

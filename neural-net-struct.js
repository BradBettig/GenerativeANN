class neuralNet{
	constructor(net_struct, inputs) {

		this.net_struct = net_struct;
		this.inputs = inputs;
		this.layers = [];

		const layerSizes = net_struct.split(",").map(size => parseInt(size.trim()));
		
		for(let i = 0; i < layerSizes.length; i++){
			this.layers.push(new Array(layerSizes[i]));
		}	
	}
}

function main(){
	let myObject = new neuralNet("3,2,1", "1");
	console.log(myObject)
}

main();

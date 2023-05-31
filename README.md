# GenerativeANN
Experience a Generative Artificial Neural Network from scratch

##
- Approximates this cosine function f(x) = (cos(x) +1) * 1/2 
- Dedicated functions to generate data, train the network, and predict
- Trains on 2000 rows of data, 16 values each row, incrementing by 0.1 and traversing the whole curve
- Example row: f(0), f(0.1), ... , f(1.5)
- Tests on never before seen data by feeding its prediction into the next row

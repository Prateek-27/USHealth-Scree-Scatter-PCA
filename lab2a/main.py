from flask import Flask, render_template, request, redirect, url_for, jsonify
import pandas as pd
import numpy as np
import sklearn
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn import metrics
import warnings
warnings.filterwarnings("ignore")


app = Flask(__name__)

# Initialize the di value to be the max
di_val = 12

# Function that prepares the data for scree plot
def scree():
    df = pd.read_csv('templates/final.csv')
    # Separate the categorical variable from the features
    X = df.drop(['state', 'county', 'percent_excessive_drinking_cat', 'population_density_per_sqmi_cat'], axis=1) # if target_variable exists
    # Standardize the features
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    # Apply PCA to the standardized data
    pca = PCA() # use the default number of components
    pca.fit(X)
    # Get the eigenvalues for each PC
    eigenvalues = pca.explained_variance_
    # Get the trace
    covariance_matrix = pca.get_covariance()
    trace = covariance_matrix.trace()
    # Get the variance and incremental variance sum
    var = []
    var_sum = []
    for x in range(len(eigenvalues)):
        var.append(100*(eigenvalues[x]/trace))
        if x == 0:
            var_sum.append(var[x])
        else:
            var_sum.append(var[x]+var_sum[x-1]) 
    #print(len(var), var)
    #print(len(var_sum), var_sum)

    return var, var_sum

# Function that prepares the data for scatter matrix
def scatter_matrix():
    di = di_val
    #di_val = 3
    #print("scatter:", di)
    data = pd.read_csv('templates/final.csv')
    data = data.drop(['state', 'county', 'percent_excessive_drinking_cat', 'population_density_per_sqmi_cat'], axis=1) # if target_variable exists

    # Standardize the features
    scaler = StandardScaler()
    X = scaler.fit_transform(data)

    # Perform PCA
    pca = PCA()
    pca.fit(X)

    # Get the PCA loadings matrix
    loadings = pd.DataFrame(pca.components_, columns=data.columns)

    # Transpose 
    loadings_t = loadings.transpose()

    #print(loadings_t.iloc[:, :di])

    di_loading = loadings_t[loadings_t.columns[:di]]

    # Sum of squared loadings
    sqrt_sum_sqred = []
    for index, row in di_loading.iterrows():
        sum_sqred = 0
        for i in range(di):
            sum_sqred += (row[i])**2 
        sqrt_sum_sqred.append(round(sum_sqred ** 0.5, 2))


    # Add to dataframe
    di_loading['sum of squared loadings'] = sqrt_sum_sqred

    #print(di_loading)

    # Sorting for
    new_loadings = di_loading.sort_values('sum of squared loadings', ascending = False)

    #print(new_loadings)

    top4_loadings = new_loadings[:4]

    rows = top4_loadings.index
    attri = []

    for i in range(len(rows)):
        attri.append(rows[i])

    x = top4_loadings.apply(lambda x: x.to_json(), axis=1)

    comb = []
    corr_labels = []

    # get the color labels for each combination of top 4
    for a in attri:
        for b in attri:
            if a!= b:
                comb.append([a, b])

    for c in comb:
        col1 = data[c[0]]
        col2 = data[c[1]]
        l = k_coloring_scatter(col1, col2)
        corr_labels.append(l)
        

    return attri, x, corr_labels

# Function that prepares the data for biplot
def  getEigen():
    df = pd.read_csv('templates/final.csv')
    X = df.drop(['state', 'county', 'percent_excessive_drinking_cat', 'population_density_per_sqmi_cat'], axis=1) # if target_variable exists
    attri = X.columns
    scaler = StandardScaler()
    X = scaler.fit_transform(X)
    pca = PCA(n_components=2)
    principal_components = pca.fit_transform(X)
    pca_df = pd.DataFrame(data = principal_components, columns = ['PC1', 'PC2'])
    # Get PC1 and PC2
    col1 = pca_df['PC1'].values
    col2 = pca_df['PC2'].values

    X = [col1.tolist(), col2.tolist()]

    # Get the corresponding color labels
    lables = k_coloring(col1, col2) 

    
    # Get loadings (eigenvectors) for top 2 PCs
    loadings = pca.components_[:2, :]

    return loadings, X, lables, attri

# Function that prepares the data for coloring biplot
def k_coloring(col1, col2):
  
  x_comb  = []
  for i in range(len(col1)):
    x_comb.append([col1[i], col2[i]])


  X = np.array(x_comb)

  # Standardize the features
  scaler = StandardScaler()
  X = scaler.fit_transform(X)

  # perform k-means clustering
  kmeans = KMeans(n_clusters=2)
  labels = kmeans.fit_predict(X)

  return labels

# Function that prepares the data for scatter matrix
def k_coloring_scatter(col1, col2):
  

  x_comb  = []
  for i in range(len(col1)):
    x_comb.append([col1[i], col2[i]])


  X = np.array(x_comb)

  # Standardize the features
  scaler = StandardScaler()
  X = scaler.fit_transform(X)

  # perform k-means clustering
  kmeans = KMeans(n_clusters=2)
  labels = kmeans.fit_predict(X)

  return labels

# This function gets the di value from scree plot (required for scatter matrix)
@app.route('/diGet', methods=['POST'])
def diGet():
    # Set the di value to be the one we get from the scree plot
    global di_val
    di_val = request.json['selectedval']


# This route is an endpoint to get the data required for the scatter matrix
@app.route('/mat_data')
def mat_data():
    # Load data
    data = pd.read_csv('templates/final.csv')
    # Drop categorical values
    data = data.drop(['state', 'county', 'percent_excessive_drinking_cat', 'population_density_per_sqmi_cat'], axis=1)
    #Call the function to get the top 4 attributes, thier loadings and coloring labels
    attri, top4_loadings, corr_labels = scatter_matrix()
    # Conversions to make it easier to transfer to javascript (as json)
    top4_loadings = top4_loadings.values.tolist()
    attri1 = data[attri[0]].tolist()
    attri2 = data[attri[1]].tolist()
    attri3 = data[attri[2]].tolist()
    attri4 = data[attri[3]].tolist()
    # Each element is a ndarry so we need to convert it to a list
    labs = []
    for ele in corr_labels:
        labs.append(ele.tolist())
    # Return the data
    return jsonify(top4_loadings = top4_loadings, attrinames = attri, 
                   attri1=attri1, attri2=attri2, attri3=attri3, 
                   attri4=attri4, corr_labels=labs)

# This route is an endpoint to get the data required for scree plot
@app.route('/data')
def data():
    var, var_sum = scree()
    return jsonify(var=var, var_sum=var_sum)

# This route is an endpoint to get the data required for biplot
@app.route('/biplot_data')
def biplot_data():
    e_vec, X, labels, attri = getEigen()
    e_vec = e_vec.tolist()
    attri=attri.tolist()
    #X = X.tolist()
    labels = labels.tolist()   
    return jsonify(e_vec=e_vec, X=X, labels=labels, attri=attri)

# All route functions
@app.route("/")
def index():
    return render_template("index.html")
    

@app.route("/plots")
def plots():
    return render_template("plots.html")

@app.route("/scatter")
def scatter():
    return render_template("scatter.html")

@app.route("/biplot")
def biplot():
    return render_template("biplot.html")


if __name__ == "__main__":
    app.run(debug=True)

def main():
    pass



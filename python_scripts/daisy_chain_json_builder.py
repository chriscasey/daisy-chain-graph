import json
from urlparse import urlparse
from pymongo import MongoClient
from optparse import OptionParser
import jsonpickle

MONGO_URL = 'localhost'
MONGO_PORT = 27017
DBNAME = 'arachnid'
existing_nodes = []


"""Node object
This is the definition of what data is contained
in each node
"""
class Node(json.JSONEncoder):
    def __init__(self, name, parent, depth):
        self.name = name
        self.parent = parent
        self.depth = depth
        self.size = 1
        self.children = []

"""Returns a list of unique daisy chains
This function will query the daisy chain daisyChainCollection
in mongo and remove duplicate chains from the results.
"""
def findData(mongo_url, mongo_port, dbname, crid):
	client = MongoClient(mongo_url, mongo_port)
	db = client[dbname]
	daisyChainCollection = db.DaisyChain

	cursor = daisyChainCollection.find({"crawlResultId": crid}, {"chain": 1, "_id":0})
	unique_chains = []
	for entry in cursor:
		chains = entry['chain']
		root_chains = []
		for url in chains:
			root_chains.append(urlparse(url).netloc)
		root_chains_set = set(root_chains)
		if root_chains_set not in unique_chains:
			unique_chains.append(root_chains_set)
	return unique_chains

"""Returns a list of root nodes
This function iterates over the list of chains and builds a node
for each item in the chain
"""
def buildNodes(chains):
	nodes = []
	for chain in chains:
		chain = list(chain)
		node = buildNodeFromChain(None, chain[0], chain[1:], 1)
		nodes.append(node)
	return nodes

"""Returns a root node
This function will recursively call the buildNodeFromChain
function until it reaches the root node.  Each recursive call
returns the node chain so far
"""
def buildNodeFromChain(parent, name, chain, depth):
	parent = getNode(name, parent, depth)
	if len(chain) > 0:
		parent.children.append(buildNodeFromChain(parent, chain[0], chain[1:], depth+1))
	return parent

"""Returns an existing node or a new node
This function checks the list of existing nodes to
see if a node with the same name and depth exists.
If it does, it increases the node size count by 1
Otherwise, it returns a new node
"""
def getNode(name, parent, depth):
	for node in existing_nodes:
		if node.name == name and node.depth == depth:
			node.size += 1
			return node
	node = Node(name, parent, depth)
	existing_nodes.append(node)
	return node	

"""Returns None
This function is used to print a node following
the chain of children to the end
"""
def printNode(str, node):
	print str, node.name, node.depth
	for i in range(0, node.depth + 1):
		str += "--"
	for child in node.children:
		printNode(str, child)	



if __name__ == "__main__":

	# to run:
	# python daisy_chain_json_builder.py -u localhost -p 27017 -d arachnid -c 8ae86e9d-3838-4e98-9182-c169b5c0eed8
	
	parser = OptionParser()
	parser.add_option("-u", "--mongourl", dest="mongourl", help="url to connect to mongo")
	parser.add_option("-p", "--mongoport", dest="mongoport", help="port to connect to mongo")
	parser.add_option("-d", "--dbname", dest="dbname", help="the name of the db you wish to access")
	parser.add_option("-c", "--crid", dest="crid", help="the crid to build the json for")

	(options, args) = parser.parse_args()

	mongo_url = options.mongourl
	mongo_port = int(options.mongoport)
	dbname = options.dbname
	crid = options.crid

	chains = findData(mongo_url, mongo_port, dbname, crid)
	nodes = buildNodes(chains)

	root = Node("root", None, 0)
	for node in nodes:
		root.children.append(node)
	pickled = jsonpickle.encode(root)
	print pickled











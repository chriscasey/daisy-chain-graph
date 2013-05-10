import json
from optparse import OptionParser


"""Node object
This is the definition of what data is contained
in each node
"""
class Node(json.JSONEncoder):
    def __init__(self, name, psi, children, parent):
        self.name = name
        self.psi = psi
        self.children = children
        self.parent = parent

result = {}
rootname = None


def buildDict(root, parent):
	
	if 'children' in root.keys() and len(root['children']) > 0:
		node = Node(root['name'], root['psi'], root['children'], parent)
		for child in node.children:
			buildDict(child, node)
	else:
		node = Node(root['name'], root['psi'], [], parent)
		rootname = root['name']
		chain = []
		chain.append(node)
		while node.parent != None:
			node = node.parent
			chain.append(node)

		chain.reverse()
		if rootname in result.keys():
			result[rootname].append(chain)
		else:
			result[rootname] = chain		


if __name__ == "__main__":

	parser = OptionParser()
	parser.add_option("-f", "--file", dest="file", help="a json file containing a daisy chain tree")
	(options, args) = parser.parse_args()

	file = options.file
	json_data = open(file)
	data = json.load(json_data)
	buildDict(data, None)
	
	deepnode = result['deep']
	for node in deepnode:
		print node.name


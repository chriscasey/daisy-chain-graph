import json
import jsonpickle
from optparse import OptionParser
import os


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
		trackername = root['name']
		chain = []
		chain.append(node)
		while node.parent != None:
			node = node.parent
			chain.append(node)

		chain.reverse()
			
		if trackername in result.keys():
			result[trackername].append(chain)
		else:
			result[trackername] = []
			result[trackername].append(chain)		


class NodeEncoder(json.JSONEncoder):
	def _iterencode(self, o, markers=None):
		if isinstance(o, Node):
			print "node instance"
			return {'name': o.name, 'psi': o.psi, 'children': len(o.children), 'parent': o.parent}

	def default(self, o, markers=None):
		if isinstance(o, Node):
			node = {'name': o.name, 'psi': o.psi, 'children': len(o.children), 'parent': o.parent}
			print node
			return node		

if __name__ == "__main__":

	parser = OptionParser()
	parser.add_option("-f", "--file", dest="file", help="a json file containing a daisy chain tree")
	(options, args) = parser.parse_args()

	file = options.file
	json_data = open(file)
	data = json.load(json_data)
	buildDict(data, None)

	pickled = json.dumps(result, cls=NodeEncoder)
	# pickled = jsonpickle.encode(result)
	f = open('../data/sample-dict.json', 'w')
	f.write(pickled)
	f.close()
	# print pickled


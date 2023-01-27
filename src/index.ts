interface Base {
    name : string;
}

type Child = TextFile | Folder

export class TextFile implements Base {
    name : string;
    content : string;

    constructor(name:string, content: string = "") {
        this.name = name;
        this.content = content;
    }
    
}

export class Folder implements Base {
    name : string;
    private children : Array<TextFile | Folder>;

    constructor(name:string, children: Array<TextFile | Folder> = []) {
        this.name = name;
        this.children = children
    }

    addChild(child: Folder | TextFile) : void {
        this.children.push(child);
    }

    getChildren() : Array<TextFile | Folder> {
        return this.children;
    }

    deleteChild(name:string): void {
        const childIndex = this.getChildIndexByName(name)
        this.children.splice(childIndex, 1);
    }

    getChildByName(name:string) : Child | undefined {
        return this.children.find(child => child.name === name);
    }

    getChildIndexByName(name:string) : number {
        const index = this.children.findIndex(child => child.name === name);
        if(index === -1) {
            throw new Error("Child not found");
        }
        return index;
    }
}

function getTabs(depth : number): string {
    let tabs: string = ""
    for(let i = 0; i < depth; i++) {
        tabs += '\t'
    }
    return tabs
}
function folderToString(folder:Folder, depth:number) :string{
    const folderChildren = folder.getChildren();
    let childrenString = ""
    for (const child of folderChildren) {
        if(child instanceof TextFile) {
            childrenString += `\n${getTabs(depth)}${child.name}`
            continue
        }
        childrenString += `\n${getTabs(depth)}${child.name === "root" ? "/" : child.name }`
        childrenString += folderToString(child, depth + 1)
    }
    return `${childrenString}`;
}

export class DocumentManager {
    private root : Folder;

    constructor(root:Folder = new Folder("root")) {
        this.root = root ;
    }

    toString(path:string) : string {
        const folder = this.getChild(path);
        if (!(folder instanceof Folder)){
            return folder.name
        }
        return `${path}${folderToString(folder, 1)}`;
    }

    addChild(path:string, childToAdd: Child) : void {
        const folderWhereAdd = this.getChild(path); 
        if(folderWhereAdd instanceof TextFile){
            throw new Error("Can't add child to a file");
        }
        folderWhereAdd.addChild(childToAdd)
    }

    duplicate(path:string) : void {
        const child = this.getChild(path);
        let newChild : Child;
        if(child instanceof TextFile){
            newChild = new TextFile(child.name+"-copie", child.content);
        } else {
            newChild = new Folder(child.name+"-copie", child.getChildren());
        }
        const folderPath = this.extractFolderPath(path);
        const folder = this.getChild(folderPath) as Folder;
        folder.addChild(newChild);
    }

    move(filePath: string, newDirectoryPath: string) : void {
        const child = this.getChild(filePath)
        const oldChildDirectoryPath = this.extractFolderPath(filePath)
        const oldChildDirectory = this.getChild(oldChildDirectoryPath) as Folder
        const newDirectory = this.getChild(newDirectoryPath)
        if(!(newDirectory instanceof Folder)) {
            throw new Error("The new path is not a folder")
        }
        newDirectory.addChild(child)
        oldChildDirectory.deleteChild(child.name)
    }

    delete(path:string) : void {
        const folderPath = this.extractFolderPath(path)
        const child = this.getChild(folderPath);
        if(child instanceof Folder){
            const childName = path.slice(path.lastIndexOf("/")+1);
            child.deleteChild(childName);
        }
    }

    getChild(path:string) : Child {  
        if(path === "/" || path === "") {
            return this.root;
        }
        if(path.charAt(0) === "/") {
            path = path.slice(1);
        }
        const result = this.tryToGetFile(path)
        if(result === undefined) {
            throw new Error("File not found :" + path);
        }
        return result;
    }

    private tryToGetFile(path: string) : Child | undefined {
        const pathArray = path.split("/");
        let currentFolder = this.root;
        let result : Child | undefined = undefined
        pathArray.forEach((childName, i) => {
            if(i === pathArray.length - 1) {
                result = currentFolder.getChildByName(childName)
                return
            }
            const currentChild = currentFolder.getChildByName(childName)
            if(!currentChild || !(currentChild instanceof Folder)) {
                throw new Error("Path is not valid :" + path);
            }
            currentFolder = currentChild;
        })
        return result
    }

    extractFolderPath(path: string) : string {
        return path.slice(0, path.lastIndexOf("/"));
    }
}

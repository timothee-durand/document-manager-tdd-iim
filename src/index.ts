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

    constructor(name:string) {
        this.name = name;
        this.children = []
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

export class DocumentManager {
    private root : Folder;

    constructor(root:Folder = new Folder("root")) {
        this.root = root ;
    }

    listFiles() : Array<string> {
        const root = new Folder("root");
        return [];
    }

    addChild(path:string, childToAdd: Child) : Error | string {
        const folderWhereAdd = this.getChild(path);
        if(folderWhereAdd === undefined) {
            throw new Error("Path is not valid");
        }  
        if(folderWhereAdd instanceof TextFile){
            throw new Error("Can't add child to a file");
        }
        folderWhereAdd.addChild(childToAdd)
        if(path === "/"){     
            return path+childToAdd?.name
        }
        return path +"/"+childToAdd?.name
        
    }

    delete(path:string) : void {
        const folderPath = path.slice(0, path.lastIndexOf("/"));
        const folder = this.getChild(folderPath);
        if(folder instanceof TextFile){
            this.root.deleteChild(folder.name);
        }
        if(folder instanceof Folder){
            const childName = path.slice(path.lastIndexOf("/")+1);
            folder.deleteChild(childName);
        }
    }

    getChild(path:string) : Child {  
        if(path === "/" || path === "") {
            return this.root;
        }
        if(path[0] === "/") {
            path = path.slice(1);
        }
        const pathArray = path.split("/");
        
        let currentFolder = this.root;
        let result : Child | undefined = undefined
        pathArray.forEach((folderName, i) => {
            if(i !== pathArray.length - 1) {  
                const currentChild = currentFolder.getChildByName(folderName)
                if(!currentChild || !(currentChild instanceof Folder)) {
                    throw new Error("Path is not valid");
                }
                currentFolder = currentChild;
                return;
            }
            result = currentFolder.getChildByName(folderName)
        })
        if(result === undefined) {
            throw new Error("File not found");
        }
        return result;
    }
}

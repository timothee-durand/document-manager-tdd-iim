import {describe, it, expect, beforeEach} from 'vitest'
import { DocumentManager, Folder, TextFile } from '.'

function getDocumentManagerWithFolderAndFile() : DocumentManager {
    const root = new Folder("root");
    const folder1 = new Folder("folder1")
    folder1.addChild(new TextFile("file1", "content"))
    root.addChild(folder1)
    return new DocumentManager(root)
}

describe('Document Manager', () => {
    let documentManager : DocumentManager;
    beforeEach(() => {
        documentManager = new DocumentManager();
    })

    describe('List ', ()=> {   
         beforeEach(() => {
            documentManager = new DocumentManager();
        })
        it('should return "/" if there is no file in root', () => {
            expect(documentManager.toString("/")).toBe("/")
        })

        it('should return the file name if the path is a file', () => {
            documentManager.addChild("/", new TextFile("file1", ""))
            expect(documentManager.toString("/file1")).toBe("file1")
        })

        it('should return "/\n\tfile1" if there is a file named "file1" in root', () => {
            documentManager.addChild("/", new TextFile("file1", ""))
            expect(documentManager.toString("/")).toBe("/\n\tfile1")
        })

        it('should return "/\n\tfolder1\n\t\tfile1" if there is a file named "file1" in root/folder1', () => {
            const folder1 = new Folder("folder1");
            folder1.addChild(new TextFile("file1", ""))
            documentManager.addChild("/", folder1);
            expect(documentManager.toString("/")).toBe("/\n\tfolder1\n\t\tfile1")
        })
    })

    describe('Get child', () => {
        let root : Folder;
        beforeEach(() => {
            root = new Folder("root");
            root.addChild(new TextFile("file1", "content"));
            documentManager = new DocumentManager(root);
        })

        it('should return a TextFile with name "file1" and content "content" if i get child "file1"', () => {
            expect(documentManager.getChild("/file1")).toStrictEqual(new TextFile("file1", "content"))
        })

        it('should return root when get /', () => {
            expect(documentManager.getChild("/")).toStrictEqual(root)
        })

        it('should also return root when get ""', () => {
            expect(documentManager.getChild("")).toStrictEqual(root)
        })

        it('should return a TextFile with name "file1" and content "content" if i get child "folder1/file1"', () => {
            documentManager = getDocumentManagerWithFolderAndFile()
            expect(documentManager.getChild("/folder1/file1")).toStrictEqual(new TextFile("file1", "content"))
        })
        it('should throw an error if the file does\'t exist', () => {
            function getFile2() {
                documentManager.getChild("/file2")
            }
            expect(getFile2).toThrow("File not found")
        })

        it('should throw an error if the path is incorrect', () => {
            function getFile2() {
                documentManager.getChild("/wrongFolder/file2")
            }
            expect(getFile2).toThrow("Path is not valid")
        })
    })

    describe('Append', () => {
        it('should return "Path is not valid" ', () => {
            function fn() {
                const fileTest = new TextFile("testFile")
                documentManager.addChild("wrongPath", fileTest)
            }
            expect(fn).toThrow("File not found");
        })

        it('should return "/testFile" ', () => {
            const fileTest = new TextFile("testFile")
            const root = new Folder("root", [new TextFile("testFile"  , "")]);
            documentManager.addChild("/", fileTest)
            expect(documentManager.getChild("/")).toStrictEqual(root);
        })

        it('should return "root/testFile" ', () => {
            const folderTest = new Folder("folderTest")
            const fileTest = new TextFile("testFile")
            const root = new Folder("folderTest", [new TextFile("testFile"  , "")]);
            documentManager.addChild("/", folderTest)
            documentManager.addChild("/folderTest", fileTest)
            
            expect(documentManager.getChild("/folderTest")).toStrictEqual(root);
        }) 

        it('should return "Can\'t add child to a file" ', () => {
            const fileTest = new TextFile("testFile")
            documentManager.addChild("/", fileTest)
            function fn() {
                const fileTest2 = new TextFile("testFile2")
                documentManager.addChild("/testFile", fileTest2)
            }
            expect(fn).toThrow("Can't add child to a file");
        }) 
    })

    describe('Delete', ()=> {
        let root : Folder 
        beforeEach(() => {
            root = new Folder("root");
            root.addChild(new TextFile("file1", "content"));
        })
        it("should return an empty root when i delete /file1", () => {
            documentManager.addChild('', new TextFile("file1", ''))
            documentManager.delete("/file1")
            const emptyRoot = new Folder("root")
            expect(documentManager.getChild('')).toStrictEqual(emptyRoot)
        })
        it("should return an empty folder1 children property when deleting /folder1/file1", () => {
            documentManager = getDocumentManagerWithFolderAndFile()
            documentManager.delete("folder1/file1")
            const emptyFolder1 = new Folder("folder1")
            expect(documentManager.getChild('folder1')).toStrictEqual(emptyFolder1)
        })
        it("should throw an error if the child does not exist", () => {
            function fn() {
                documentManager.delete("/file2")
            }
            expect(fn).toThrow("Child not found")
        })
    })
    describe('Duplicate', () => {
        it('should return "Path is not valid" ', () => {
            function fn() {
                documentManager.duplicate("wrongPath")
            }
            expect(fn).toThrow("File not found");
        })
        it('should return the root folder with 2 identicals files "filetest" and "filetest-copie', () => {
            documentManager.addChild("/", new TextFile("filetest", "content"))
            documentManager.duplicate("/filetest")
            let root = new Folder("root", [new TextFile("filetest", "content"), new TextFile("filetest-copie", "content")]);
            expect(documentManager.getChild("/")).toStrictEqual(root);
        })
        it('should return the root folder with 2 identicals folder "folderTest" and "folderTest-copie" with same children', () => {
            documentManager.addChild("/", new Folder("folderTest", [new TextFile("filetest", "content")]))
            documentManager.duplicate("/folderTest")
            let root = new Folder("root", [new Folder("folderTest", [new TextFile("filetest", "content")]), new Folder("folderTest-copie", [new TextFile("filetest", "content")])]);
            expect(documentManager.getChild("/")).toStrictEqual(root);
        })
    })

    describe('Move', ()=> {
        it('should move file1 from folder1 to folder2', () => {
            documentManager = getDocumentManagerWithFolderAndFile()
            const folder2 = new Folder("folder2")
            documentManager.addChild('', folder2)
            
            documentManager.move("folder1/file1", "folder2")
            
            const file1 = new TextFile("file1", "content")
            expect(documentManager.getChild("folder2/file1")).toStrictEqual(file1)
        })
        it("should throw an error when the new folder path is not a directory", () => {
            function fn() {
                const root = new Folder("root")
                root.addChild(new TextFile("file1", 'content'))
                root.addChild(new TextFile("file2", 'content'))
                const manager = new DocumentManager(root)
                manager.move("/file1", '/file2')
            }
            expect(fn).toThrow("The new path is not a folder")
        })
    })
})

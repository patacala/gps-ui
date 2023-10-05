import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { JsonPipe } from '@angular/common';
import { Component, EventEmitter, Injectable, Input, Output } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
import { ClassifierService } from '@services';
import { BehaviorSubject } from 'rxjs';
import { ButtonComponent } from '../button/button.component';

/**
 * Node for to-do item
 */
export class TodoItemNode {
    children!: TodoItemNode[];
    item!: string;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
    item!: string;
    level!: number;
    expandable!: boolean;
}

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase {
    dataChange = new BehaviorSubject<TodoItemNode[]>([]);

    get data(): TodoItemNode[] {
        return this.dataChange.value;
    }

    constructor(private _classifier: ClassifierService) {
        this.initialize();
    }

    initialize() {
        this._classifier.getClassifier().subscribe((value) => {
            this.dataChange.next(value.rows);
        })
    }

    /**
     * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
     * The return value is the list of `TodoItemNode`.
     */
    buildFileTree(obj: { [key: string]: any }, level: number): TodoItemNode[] {
        return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
            const value = obj[key];
            const node = new TodoItemNode();
            node.item = key;

            if (value != null) {
                if (typeof value === 'object') {
                    node.children = this.buildFileTree(value, level + 1);
                } else {
                    node.item = value;
                }
            }

            return accumulator.concat(node);
        }, []);
    }

    /** Add an item to to-do list */
    insertItem(parent: TodoItemNode, name: string) {
        if (parent.children) {
            parent.children.push({ item: name } as TodoItemNode);
            this.dataChange.next(this.data);
        }
    }

    updateItem(node: TodoItemNode, name: string) {
        node.item = name;
        this.dataChange.next(this.data);
    }
}

/**
 * @title Tree with checkboxes
 */
@Component({
    selector: 'app-tree-classifiers',
    templateUrl: 'tree.component.html',
    standalone: true,
    imports: [MatTreeModule, MatIconModule, MatCheckboxModule, JsonPipe, ButtonComponent],
    providers: [ChecklistDatabase],
})
export class TreeComponent {
    @Input() activeClassifier: any
    /** Map from flat node to nested node. This helps us finding the nested node to be modified */
    flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

    /** Map from nested node to flattened node. This helps us to keep the same object for selection */
    nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

    /** A selected parent node to be inserted */
    selectedParent: TodoItemFlatNode | null = null;

    /** The new item's name */
    newItemName = '';

    treeControl!: FlatTreeControl<TodoItemFlatNode>;

    treeFlattener!: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

    dataSource!: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

    /** The selection for checklist */
    checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

    classifiers: Map<string, number[]> = new Map();
    classifiers2: Map<string, Set<number>> = new Map();

    @Output() sendClassifiers: EventEmitter<any> = new EventEmitter();
    @Output() clear: EventEmitter<any> = new EventEmitter();

    constructor(
        private _database: ChecklistDatabase,
        private _classifier: ClassifierService
    ) {
        this.treeFlattener = new MatTreeFlattener(
            this.transformer,
            this.getLevel,
            this.isExpandable,
            this.getChildren,
        );
        this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
        this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this._database.dataChange.subscribe(data => {
            if (data) { 
                this.dataSource.data = data; 
                if (this.treeControl.dataNodes && this.activeClassifier) this.checkNodesSelected();
            }
        });
    }
    
    ngOnInit() {
        this._classifier.clearCheckboxes.subscribe(() => {
            this.checklistSelection.clear(); // Desmarca todos los checkboxes
        });
    }

    getLevel = (node: TodoItemFlatNode) => node.level;

    isExpandable = (node: TodoItemFlatNode) => node.expandable;

    getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

    hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

    hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

    /**
     * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
     */
    transformer = (node: any, level: number) => {
        const existingNode = this.nestedNodeMap.get(node);
        const flatNode = existingNode && existingNode.item === node.item ? existingNode : new TodoItemFlatNode();
        flatNode.item = node;
        flatNode.level = level;
        flatNode.expandable = !!node.children?.length;
        this.flatNodeMap.set(flatNode, node);
        this.nestedNodeMap.set(node, flatNode);
        return flatNode;
    };

    checkNodesSelected() {
        if (this.activeClassifier && this.activeClassifier[0]) {
            this.treeControl.dataNodes.forEach((node: any) => {
                const nodeId = node.item.clvanuid;
                
                if (this.activeClassifier[0].includes(nodeId)) {
                    /*
                        const descendants = this.treeControl.getDescendants(node);
                        if (descendants.length > 0) {
                            this.checkAllDecendants(descendants);
                        } 
                    */
                    this.checklistSelection.select(node);
                    this.checkAllParentsSelection(node);
                }
            });
        }
    }
    
    checkAllDecendants(descendants: Array<TodoItemFlatNode>) {
        descendants.map(child => this.checklistSelection.select(child))
    }

    /** Whether all the descendants of the node are selected. */
    descendantsAllSelected(node: TodoItemFlatNode): boolean {
        if (!this.treeControl.dataNodes) return false;

        const descendants = this.treeControl.getDescendants(node);

        const descAllSelected =
            descendants.length > 0 &&
            descendants.every(child => {
                return this.checklistSelection.isSelected(child);
            });
        return descAllSelected;
    }

    /** Whether part of the descendants are selected */
    descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
        if (!this.treeControl.dataNodes) return false;
        const descendants = this.treeControl.getDescendants(node);

        const result = descendants.some(child => this.checklistSelection.isSelected(child));
        return result && !this.descendantsAllSelected(node);
    }

    /** Toggle the to-do item selection. Select/deselect all the descendants node */
    todoItemSelectionToggle(node: TodoItemFlatNode): void {
        this.checklistSelection.toggle(node);
        const descendants = this.treeControl.getDescendants(node);
        this.checklistSelection.isSelected(node)
            ? this.checklistSelection.select(...descendants)
            : this.checklistSelection.deselect(...descendants);

        // Force update for the parent
        descendants.forEach(child => this.checklistSelection.isSelected(child));
        this.checkAllParentsSelection(node);
    }

    /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
    todoLeafItemSelectionToggle(node: TodoItemFlatNode): void {
        this.checklistSelection.toggle(node);
        this.checkAllParentsSelection(node);
    }


    getParentName(node: TodoItemFlatNode) {
        let parent: TodoItemFlatNode | null = this.getParentNode(node);
        let name = '';

        while (parent) {
            // @ts-ignore
            if (!this.getParentNode(parent)) {
                name = (parent.item as any).clasdesc;

                return name;
            }

            parent = this.getParentNode(parent);
        }

        if (!parent) return (node.item as any).clasdesc
    }

    addClassifiers(node: TodoItemFlatNode) {
        let parent: TodoItemFlatNode | null = this.getParentNode(node);
        let ids: Set<number> = new Set();
        let parentName = this.getParentName(node);

        if (!parent) {
            let name = (node.item as any).clasdesc;
            // @ts-ignore
            this.classifiers2.set(name, new Set([node.item.clasnuid]));

            let descendants = this.treeControl.getDescendants(node);

            descendants.length > 0 && descendants.map(child => this.classifiers2.get(name)?.add(
                (child.item as any).clvanuid
            ))
        } else {
            // @ts-ignore
            ids.add(node.item.clvanuid)

            while (parent) {
                // @ts-ignore
                parent.item.clvanuid && ids.add(parent.item.clvanuid);

                parent = this.getParentNode(parent);
            }
        }
        // Create a Set or push into existing Set
        // @ts-ignore
        this.classifiers2.set(parentName, this.classifiers2.has(parentName) ? this.classifiers2.get(parentName).add(...Array.from(ids)) : ids);
    }

    deleteClassifiers(node: TodoItemFlatNode) {
        let name = this.getParentName(node);

        // Delete whole Set
        if ((node.item as any).clasdesc === name) {
            this.classifiers2.delete(name);

            return;
        }

        // Delete an ID
        this.classifiers2.has(name) ? this.classifiers2.get(name)?.delete((node.item as any).clvanuid) : null;
    }

    /* Checks all the parents when a leaf node is selected/unselected */
    checkAllParentsSelection(node: TodoItemFlatNode): void {
        let parent: TodoItemFlatNode | null = this.getParentNode(node);

        while (parent) {
            this.checkRootNodeSelection(parent);

            // End while
            parent = this.getParentNode(parent);
        }

        !this.checklistSelection.isSelected(node) ? this.deleteClassifiers(node) : this.addClassifiers(node);
        this.saveClassifiers();
    }

    /** Check root node checked state and change it accordingly */
    checkRootNodeSelection(node: TodoItemFlatNode): void {
        const nodeSelected = this.checklistSelection.isSelected(node);
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected =
            descendants.length > 0 &&
            descendants.every(child => {
                return this.checklistSelection.isSelected(child);
            });
        if (nodeSelected && !descAllSelected) {
            this.checklistSelection.deselect(node);
        } else if (!nodeSelected && descAllSelected) {
            this.checklistSelection.select(node);
        }
    }

    /* Get the parent node of a node */
    getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
        const currentLevel = this.getLevel(node);

        if (currentLevel < 1) {
            return null;
        }

        const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

        for (let i = startIndex; i >= 0; i--) {
            const currentNode = this.treeControl.dataNodes[i];

            if (this.getLevel(currentNode) < currentLevel) {
                return currentNode;
            }
        }
        return null;
    }

    saveClassifiers() {
        let sets = Object.fromEntries(this.classifiers2);
        console.log(sets);
    
        let arrIds = Object.keys(sets).map(key => {
            if (sets[key]) {
                return Array.from(sets[key]).filter(value => value !== null && value !== undefined);
            } else {
                return [];
            }
        });
    
        this.sendClassifiers.emit(arrIds);
    }
}
class EnsureGsnCompatible {
    constructor(reporter, config) {
        this.inheritance = true
        this.gsnImportPath = config.rules['gsn/ensure-gsn-compatible'][1]
        this.ruleId = 'ensure-gsn-compatible'
        this.reporter = reporter
        this.config = config
        this.meta = {
            isDefault: true,
            recommended: true,
            fixable: true,
        }
    }

    ImportDirective(node) {
        if (node.path.endsWith('/Context.sol')) {
            this.foundGsnImport = true
        }
        this.lastImportDirective = node
    }

    PragmaDirective(node) {
        this.pragmaDirective = node
    }

    ContractDefinition(node) {
        // disable these errors if contract type is an interface/library, if GSN import path has not been set
        // or if second letter of contract name is capitalized (likely to be a virtual interface contract)
        if (
            node.kind !== 'contract' ||
            !this.gsnImportPath ||
            (node.name.startsWith('I') && node.name[1].toUpperCase() === node.name[1])
        ) {
            return
        }
        this.contractName = node.name
        if (node.baseContracts.length === 0) {
            this.inheritance = false

            if (!this.foundGsnImport) {
                this.reporter.error(
                    node,
                    this.ruleId,
                    `Context.sol is not imported in a non-inherited GSN compatible contract`,
                    (fixer) => {
                        const insertRange =
                            this.lastImportDirective != undefined
                                ? this.lastImportDirective.range
                                : this.pragmaDirective.range
                        return fixer.insertTextAfterRange(insertRange, `;\n\nimport "${this.gsnImportPath}";`)
                    }
                )
            }

            this.reporter.error(
                node,
                this.ruleId,
                `Context.sol is not inherited in a non-inherited GSN compatible contract`,
                (fixer) => {
                    const rangeIndex = node.range[0] + 9 + this.contractName.length
                    return fixer.replaceTextRange([rangeIndex, rangeIndex], ` is Context `)
                }
            )
        }
    }

    MemberAccess(node) {
        const mName = node.memberName
        if (node.expression.name === 'msg' && (mName === 'data' || mName === 'sender')) {
            this.reporter.error(
                node,
                this.ruleId,
                `Avoid to use of msg.${mName} when writing GSN compatible contracts`,
                (fixer) => {
                    if (this.inheritance && !this.foundGsnImport && !this.inheritanceWarning) {
                        this.inheritanceWarning = true
                        // I'd like to do reporter.warn here, but solhint isn't configurable enough and will make it into an error which I don't want
                        console.log(
                            `GSN solhint plugin fixed ${this.contractName} but no GSN import was present. This could cause compile errors if ${this.contractName} doesn't inherit from Context.sol.`
                        )
                    }
                    return fixer.replaceTextRange(node.range, `_msg${mName[0].toUpperCase() + mName.slice(1)}()`)
                }
            )
        }
    }
}

module.exports = [EnsureGsnCompatible]

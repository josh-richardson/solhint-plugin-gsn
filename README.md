# solhint-plugin-gsn
This [Solhint](https://github.com/protofire/solhint/) plugin lets you ensure that none of your contracts use `msg.sender` or `msg.data`, specifically intended for use with contracts and codebases which integrate with Gas Station Network, which has specific implementations of these functions. Caveat: the plugin will not be able to scan for usages in imported code from outside your working tree (such as in node_modules) unless you explicitly specify this.

## Setup

First install the necessary packages:

```
npm install --save-dev solhint solhint-plugin-gsn
```

Then add a `.solhint.json` configuration file:

```json
{
  "plugins": ["gsn"],
  "rules": {
    "gsn/ensure-gsn-compatible": "error"
  }
}
```

This rule will emit the following errors:
- An error if any of your contracts use `msg.sender` or `msg.data`
- An error if any of your contracts are non-inherited and do not import `Context.sol` from GSN/OZ.
- An error if any of your contracts are non-inherited and do not inherit `Context.sol` from GSN/OZ.

Furthermore, the plugin can also attempt to fix these problems if used with `--fix`.

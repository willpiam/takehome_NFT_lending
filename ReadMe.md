# Borrow DAPP PoC

These contracts are not meant to be secure. They are a proof of concept for a cross chain lending platform. But only a proof of concept.

## Key Files

#### contracts/contracts/BorrowDAPP.sol
contains all of my on chain code

#### contracts/ignition/modules/BorrowDAPP.ts
deployes the contracts to sepolia and linea sepolia

#### contracts/scripts/experiment.ts
initialtes two cross chain actions, both from L1 to L2. The first is a simple call to increment a counter. The second locks an NFT on the L1 and lends dollars on the L2

#### contracts/scripts/processMessages.ts 
using the commit provided by the postman use the Message service to post and call the calldata

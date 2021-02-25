/* eslint-disable prefer-const */
import {Address, log} from '@graphprotocol/graph-ts'
import {Transfer} from '../../generated/templates/UniswapPair/Pair'
import {ERC20} from '../../generated/templates/UniswapPair/ERC20'
import {
  ADDRESS_ZERO,
  BI_18,
  convertTokenToDecimal,
  createOrUpdate,
  MINUS_ONE,
  updateDayData,
  ZERO_BI
} from "../util";
import {LPTransfer} from "../../generated/schema";

let PROVIDER_NAME = "Uniswap";

function createTransferEvent(event: Transfer, userAddrs: Address): void {
  let transactionHash = event.transaction.hash;
  let txHash = transactionHash.toHexString()
  let id = txHash
    .concat('-')
    .concat(userAddrs.toHexString())

  let transfer = new LPTransfer(id)
  transfer.userAddress = userAddrs
  transfer.poolAddress = event.address
  transfer.transactionHash = transactionHash
  transfer.blockNumber = event.block.number
  transfer.from = event.params.from
  transfer.to = event.params.to
  transfer.value = convertTokenToDecimal(event.params.value, BI_18)
  transfer.timestamp = event.block.timestamp
  transfer.save()
}

export function handleTransfer(event: Transfer): void {
  let uniV2TokenAddrs = event.address;
  let contract = ERC20.bind(uniV2TokenAddrs);
  let to = event.params.to as Address;
  let from = event.params.from as Address;
  let initiator = event.transaction.from;


  if (to.toHexString() == ADDRESS_ZERO) { // BURN
    let amt = event.params.value
    log.warning("BURN event for tx {} for user {} with amount {}", [event.transaction.hash.toHexString(), initiator.toHexString(), amt.toString()])
    let lp = createOrUpdate(PROVIDER_NAME, uniV2TokenAddrs, initiator, amt.times(MINUS_ONE));
    updateDayData(lp, initiator, event);

    createTransferEvent(event, event.params.from)
  } else if (from.toHexString() == ADDRESS_ZERO) { // MINT
    let amt = event.params.value
    log.warning("MINT event for tx {} for user {} with amount {}", [event.transaction.hash.toHexString(), initiator.toHexString(), amt.toString()])
    let lp = createOrUpdate(PROVIDER_NAME, uniV2TokenAddrs, initiator, amt);
    updateDayData(lp, initiator, event);

    createTransferEvent(event, event.params.to)

  } else { // TRANSFER
    if (initiator == to) {
      let lp = createOrUpdate(PROVIDER_NAME, uniV2TokenAddrs, to, ZERO_BI);
      updateDayData(lp, to, event);
    }
    if (initiator == from) {
      let lpFrom = createOrUpdate(PROVIDER_NAME, uniV2TokenAddrs, from, ZERO_BI);
      updateDayData(lpFrom, from, event);
    }

    createTransferEvent(event, event.params.to)
    createTransferEvent(event, event.params.from)

  }

}


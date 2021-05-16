/* eslint-disable prefer-const */
import {Address, log} from '@graphprotocol/graph-ts'
import {Transfer} from '../../generated/templates/SushiswapPair/Pair'
import {
  ADDRESS_ZERO,
  createOrUpdateLiquidityPosition,
  createTransferEvent,
  MINUS_ONE,
  updateDayData,
  ZERO_BI
} from "../util";

let PROVIDER_NAME = "Elk";

export function handleTransfer(event: Transfer): void {
  let poolAddress = event.address;
  let to = event.params.to as Address;
  let from = event.params.from as Address;
  let amt = event.params.value;

  if (to.toHexString() == ADDRESS_ZERO) { // BURN
    log.warning("[{}] BURN event for tx {} for user {} with amount {}", [PROVIDER_NAME, event.transaction.hash.toHexString(), from.toHexString(), amt.toString()])

    updateDayData(createOrUpdateLiquidityPosition(PROVIDER_NAME, poolAddress, from, amt.times(MINUS_ONE)), from, event);
    createTransferEvent(event, from, from, to, amt)

  } else if (from.toHexString() == ADDRESS_ZERO) { // MINT
    log.warning("[{}] MINT event for tx {} for user {} with amount {}", [PROVIDER_NAME, event.transaction.hash.toHexString(), to.toHexString(), amt.toString()])

    updateDayData(createOrUpdateLiquidityPosition(PROVIDER_NAME, poolAddress, to, amt), to, event);
    createTransferEvent(event, to, from, to, amt)

  } else { // TRANSFER
    updateDayData(createOrUpdateLiquidityPosition(PROVIDER_NAME, poolAddress, to, ZERO_BI), to, event);
    updateDayData(createOrUpdateLiquidityPosition(PROVIDER_NAME, poolAddress, from, ZERO_BI), from, event);
    // we don't need to keep track of the initiator here because the transfer logs will have logged the lp token transfer event
    createTransferEvent(event, from, from, to, amt)
    createTransferEvent(event, to, from, to, amt)

  }
}


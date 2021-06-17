/* eslint-disable prefer-const */
import {Address, log} from '@graphprotocol/graph-ts'
import {
  ADDRESS_ZERO,
  createOrUpdateLiquidityPosition,
  createTransferEvent, maybeCreateUserLpTransaction,
  MINUS_ONE,
  updateDayData,
  ZERO_BI
} from "../util";
import {Transfer} from "../../generated/templates/QuickswapPair/Pair";

let PROVIDER_KEY = "quickswap_matic";

export function handleTransfer(event: Transfer): void {
  let poolAddress = event.address;
  let to = event.params.to as Address;
  let from = event.params.from as Address;
  let amt = event.params.value;

  // this is who executed the txn, it can be diff than the from address
  let initiator = event.transaction.from;

  maybeCreateUserLpTransaction(event, initiator, poolAddress)

}


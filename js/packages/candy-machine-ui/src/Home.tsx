import { useEffect, useMemo, useState, useCallback } from 'react';
import * as anchor from '@project-serum/anchor';

import styled from 'styled-components';
import { Container, Snackbar } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Alert from '@material-ui/lab/Alert';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletDialogButton } from '@solana/wallet-adapter-material-ui';
import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  CANDY_MACHINE_PROGRAM,
  getCandyMachineState,
  mintOneToken,
} from './candy-machine';
import { AlertState } from './utils';
import { Header } from './Header';
import { MintButton } from './MintButton';
import { GatewayProvider } from '@civic/solana-gateway-react';
import Display from './shinobisers.gif';
import { CrossMintButton } from "@crossmint/client-sdk-react-ui";


const ConnectButton = styled(WalletDialogButton)`
  width: 100%;
  height: 60px;
  margin-top: 10px;
  margin-bottom: 5px;
  background: linear-gradient(180deg, #604ae5 0%, #813eee 100%);
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

const MintContainer = styled.div``; // add your owns styles here

export interface HomeProps {
  candyMachineId?: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  txTimeout: number;
  rpcHost: string;
}

const Home = (props: HomeProps) => {
  const [isUserMinting, setIsUserMinting] = useState(false);
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined,
  });
  const [isDisabled, setIsDisabled] = useState(true);

  const rpcUrl = props.rpcHost;
  const wallet = useWallet();

  const anchorWallet = useMemo(() => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);

  const refreshCandyMachineState = useCallback(async () => {
    if (!anchorWallet) {
      return;
    }

    if (props.candyMachineId) {
      try {
        const cndy = await getCandyMachineState(
          anchorWallet,
          props.candyMachineId,
          props.connection,
        );
        console.log(JSON.stringify(cndy.state, null, 4));
        setCandyMachine(cndy);
      } catch (e) {
        console.log('There was a problem fetching Candy Machine state');
        console.log(e);
      }
    }
  }, [anchorWallet, props.candyMachineId, props.connection]);

  const onMint = async () => {
    try {
      setIsUserMinting(true);
      document.getElementById('#identity')?.click();
      if (wallet.connected && candyMachine?.program && wallet.publicKey) {
        const mintTxId = (
          await mintOneToken(candyMachine, wallet.publicKey)
        )[0];

        let status: any = { err: true };
        if (mintTxId) {
          status = await awaitTransactionSignatureConfirmation(
            mintTxId,
            props.txTimeout,
            props.connection,
            true,
          );
        }

        if (status && !status.err) {
          setAlertState({
            open: true,
            message: 'Congratulations! Mint succeeded!',
            severity: 'success',
          });
        } else {
          setAlertState({
            open: true,
            message: 'Mint failed! Please try again!',
            severity: 'error',
          });
        }
      }
    } catch (error: any) {
      let message = error.msg || 'Minting failed! Please try again!';
      if (!error.msg) {
        if (!error.message) {
          message = 'Transaction Timeout! Please try again.';
        } else if (error.message.indexOf('0x137')) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf('0x135')) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          window.location.reload();
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }

      setAlertState({
        open: true,
        message,
        severity: 'error',
      });
    } finally {
      setIsUserMinting(false);
    }
  };

  useEffect(() => {
    refreshCandyMachineState();
    const WL = [
      'EkBHhrqexYqE1wm5QEZ26QBdhf78uKCVaC1bFy7DF3Ct',
      'BjfB1Vi1ydWeaA8DJsAw1GqnHKj7EoB5pZAwaVEXnhZK',
      'HeWyrXHyxEbs3WAKvTBFqLT6s87XRzMAxHHKzu4drPW7',
      'FjCAicyTQZdosL7icuE1WEihKGhH1pGUmWu1taBibN3D',
      '7yTeHRjrcC1JWFoaVD47abMQgtGXmr846fhBFQTMs6G1',
      'ALSq9XudgtWisvJy1xtrX1gMPTmTE8J4eDsNuvXGJv1a',
      '71n76Va3oU1yxtmC4kbEi9Tjxe3T3xuWwFhWm95xJg5v',
      'Bcr7Khpi2MhkNCh7tgkQpG5Cs6JgBuygrtAC9fgRgDWY',
      'GduznGx7zbiNmevBFr8KmbNbKCTdLyDwDp5FJRrfUNpk',
      'AhynTRYSrG84wzzgq8s8KVusMvgrZ4CVNkAtx1mYC4Np',
      '566WS35AnpoM4jKD1hjaLW8haqdV8bvhCvWj1UGVmm6R',
      '3JL5zM2WTucT8fSVnGzZaBMx5LX4DR44wrqW6QPC83sS',
      'CAKm2RqbFjT6jALqVZzXUj7TYcHVj8f62dACqPFLRXVs',
      'G3SsXr575UKxvebz3EeLMfQmk1rQChC6Us9e5X1jH72f',
      'AeQpB28j2Ph9tXLbBzSYS5Gn5WcfHwhMWi4Kw2HM8kdZ',
      'DtrJHA4sc5N7qYRc9FEB4EREvPw9HHxqsfoG13HQjsBD',
      'GZ72dLEsF7xp8VaAnyjWXseuVNLpGvSPLdLQ9gPmHgox',
      '9JFXPt79U3qAXirKFdUbhpmKKiqQFHPdXTC5u5p1hnGB',
      'FE2cDFACPZHR4b1jSALvxKdgeuJH84yRNRpXY5GfnV1N',
      'EZMJXdTEwgbNnTwXQa3nnEjdGioBzR9FHGqXkSx6Ji9D',
      '6GSYfxywKhQpQLqc1rbxdtiovDezn3Cpcs56Kn3PC43e',
      '36mPNkVWw931YQj1Yyu8AavqdGWLp3mQrY64VWsbBjde',
      'B5bcAPygToBuhDMBKys8eocTN7uFmHvmoPQ73pTRanit',
      'EQd51ms22Rj16PKktzWqNbavMqerPwTBQevUGD6wxMQL',
      'Ufx125SKWacM4DXTGtTvmA4eLssaxCtnBX7x3armRTe',
      '6LXneogv51gKnicrEgdmyq71pZZ5atpsA4kGeGqjgd8M',
      '3SnnjCkByrsNPpQCaEsDzdsv7TDA6W4SFo6XzWmEALdu',
      '8hKV5XjahzafAc4z5YbCptrHrmqWViSuEvoHUB7iuDQY',
      'z263XYbqMaKe8oJHdR8hkNUbB5zt4iLB3Yx2vYjJfSR',
      '6TkSWhELzpnLoUSEbMLxgGhCZ2ca98Hyvytfnx6EDQ89',
      'Fu7CEzFjNyUXDHBLxLPrWYoB935KYZGoZiotdQfzWnbX',
      'AycmdhVV6uPJdSkXx32iZuX4LWySpUrLDFeaZYMfgZRX',
      '5CZpkRtt66dWsMLvM548DCdYWT3KRU44jgDRDDV1xUD4',
      'F7SRtWpcEz1HBPVoBeyRXMPhRe3WRqHnSiwW56f4CnzH',
      '61XRr33cZ1QqbpwrEmRand2EYkZigXqkY8aNXY8JHMRZ',
      'F8FjbEXtPW7S4dZk1si768fFCtRZBjPC3Wr27BLhBTQR',
      'Ac1PJYJqwK2TTYGrihAQf24H1sXRoBPGXAtcsuDEmFG6',
      'CeybTm9ZU2LXF8SSeuvuv1Y6RTT47kHC9KMtN9uoCMgm',
      'CBi3vX1ePz43R2Lt6m8DePXxGuEwmijXZmfZZBoQuXEn',
      '3sSTecc4S51KMhoYLYZP3ktYb89T5dAmKTvKVdjGiQME',
      'X8w8ewaiLLhRitVYyF9LDjX4dpEwprXuqYQX7MSUr4V',
      '9r6Cf9tGmoM6aTkFxSTWf89iqEszMHh9uGWiuych7aie',
      '8YeNHanJziE29fsFpfMoxZR4bFCpXrDcsqL8pd7atxw8',
      '2PQQmLc3y5yBu2gsrh4rhNTfaRcztx7GKSVbbkzXTLNK',
      '6Ayn1cyiEzdQxJZCjZUHsjY4gJq3j9zbLBMDoBa65qvn',
      'A7rNc1BGvEaCy4i24jURXk1TqDX8fpQk9CHUVMiERcAB',
      '37D3YPmUieasBMLQmZCEbZxjJFpPwUdeZNoT6DddUD7W',
      'EnXukqPkXC7dtiKbeB5oJFczDhH9C4k5LF2fW3uegSTx',
      'HmTRFNe8qeeetUmxU6ECjmjBp2fiuWEYtTXqsCHPMTHK',
      '8RLYZTfid6N1q3zPUQHpTFi3CKLkKtc6LYbffdZmxP3M',
      'Crzc5KwgyUHp3RaTizLVwPTUySLHVGvyuh1B2wKYqqug',
      'GoNHodKjQadrzzo9MC6FyjYKfmpjwzq49uyKfwi7GiWq',
      '2UYUGpJ14XxELHgHgqYzAihCjDFwqRLwQsJHafFYVCXx',
      '6jHaYmKoc5H9KEw7XJ1v1hZ2n9X63NBtFVxHsNM71fZW',
      '7KzH8RB3o5MxfeEnyhSRK4vKpqJW1r3r66JDKQVwxR3g',
      'CBPKhXmcDXrrdZhygLxoExgFpoEfu5wTnc5XzpLUrh72',
      'GFWAYvJvF1NvoipTWmZUCwT8oD95WijuvG8rXYwWyJa6',
      'BdNMWL35qtTSckUQrnBy5tUCKvcQjBTMhdybDP551u6C',
      'CEzPEDreBzsjCugBH3bvJiE4EJC4CVqSpUj1qyxZYVnU',
      '2QxawuwnFp33BH7xTrmhDHrU9N3yW8k8vVEst1EM3JPi',
      'CXfmARwhKDbpABMe9PFBEkudnAJ2en9NxYqgSisgHiVf',
      'FhicgRdyyWYHzEtyAmohUF73FnJLcUNhTJeWCQiQPz74',
      '6ijGq9VCFsetg3pQ4SS6Gh3zuR5uU2rRx5w9Jh1Zferi',
      '4k22PjhQgLsBSjiAiK9fBYLwjyto6sTFh521tYQrUtFQ',
      '7Eqcj8JHbTfsJJwwMbCbcqHLjshcdiLv1cFvAwVtAcc6',
      'AjHEcC79DRwAcyxM9P2WghfUSkKtyBR3kVN8deQFNZ2y',
      'Cbru8Ks4v8qwcA6F8QQ7RuWc7Dt7TiaFScQdVcQQ5zEi',
      'BfuLiwV5D3c4pHX8m2YXiJSLUbQr4PwbLbWvmGBK2vU',
      'WLYJBnzsQLqy9CXPRgUfVdhnv8DHvaAGfMbDCmsvr4f',
      'F4mvSS8kkEvanD4nZafaDHrEwryzsxfNeh1GBKp3xv9V',
      '4yKSbuGhoSuWvP4EzL3WdEooc8PkEfxPAzkPmnTGdyUn',
      '2e4kPNknJ9VdxUw9wXC9spsye2RK2pbu395f97h7arCm',
      'D2mbQcASEyx6qvdtXU6d61xpEUW2GVU5q1QmJ5FrNtcG',
      'EFYMabtaJrGPUJMXRHeptmftBG7ctQVFKE63fLnTjrhb',
      'EcJoGZfCqxB5aCPG3azT12qCkKkWauE1QhFGab9yBhpX',
      '7uDbbhSke7FhKauPKKLS5cgtzRmX12WN1xpRZ5xKsFL9',
      '9Fb5CDSrq1W3iJThM3nMQkEQwzHpesbQSMfm2xTvAWoV',
      'Ao56K19ZLh9WDUUibQRrWVhKKRgzoDhDeEU3MRcPxugL',
      'GrJLaFiK41Wss8KNzxfcGzGfFG8TxbkZ99hDGai63Qm2',
      '8kSREKGN4zo8bU2PEe6skru6vaxp4qNF7pZiXHQUdso1',
      'Bp5rZq9h4FmxGxYFRSxSTj1XBqVMnHGbLEdWB9jNvyR5',
      '5MhdtjPkQf5jrpMQvpgor1F2REMwyPKi26qjK3Bb3fQ6',
      '3fqjH5SznesFQo2WJhc1Biqkmqnt7U2QUJUJkdWNfVqh',
      '9Z4d7adGfRg7uauhNRcWKfGCJFUwyAYvPCKHPSs2F164',
      'EqmgmnJhaQV58wNFgLtyPPHdxHcoQ9crtXtETsM3WkwX',
      'AQTLENyrzrp6uKZ1PGSC19XHmdf5kqHwsHAQ9pvSk2ir',
      '4TseCWtkFoJzUqLwx47EVabFLQznkkz6JifhjtpgFpHj',
      '9KxMLkeuLiwVpGi2cqpCpVHm1SVWfRubNN3LoRzif2Cc',
      '3HYW3aqr9BQ5YvMMS2jJxAeJLMtstFqY7B5PTfVYJpRk',
      'CcbVPQe3cBeLYHtRSonjJ8LxGKcFptTUmQmD1sTt2gGm',
      '7GakLnvSmmdjoYUWsJfDih8aCNhorBqsTnEjq4ue3hiY',
      'BMp1usoVmAANSzwcqTrVNWLKCXAdmcs25QnBxz2BcGmb',
      'CQTTmKFSM8injf1sd2uGLKN9wHDKLYZnts9RZLyVdcmZ',
      '8Duh1ZPbCfzcSw8cXMVkoavKEav7NrXWKtFCrcUkUXyF',
      '3wzeu6Mz2W87NRjjroMdLK928YoECxzQCc4j6DLTKc7D',
      '1RPx45n5o5UNoSeFEfjoTMGR5x71GK3cY2iujK2pobt',
      '9viTGUHUCMJuvR5uF5hfaBmrJio1qmPmytuq5Zodexsb',
      '4tpSuCkarKdDbW2Re9bHnnekFa8WKCb1jeKedS38YvGj',
      'Hp1AJ8zxipz3RKYtxddzraMTpfyjnYytSyoZWp2AiN6h',
      'CdLJvL55a2qHTDLWNHPz9NK3LL81NuvuRZjEdyeHYMbr',
      '3UZVm5G2f7YkJ2QLFqxqBAsCC8t8jaoivZ7mYTKPHwsg',
      '2ExHWP44g2jUpHPinpTZrNp7JjkZGybTUGvpWiye9LtN',
      '6icrp5daDgPnt55DnAziFzDhYxgc8FA4yASRYQC8GSXM',
      'mEz9Ju5Lg6U8dxvjdRUQXQHEx9pcwL4ZCy7zADazmWY',
      'DS7W56VRJVYspZteG26eB9HWmgzB3QWnZXF7mU3dCWi3',
      'DvBy6rK2ygUT91LMuDEVmFdaVfpYfSWa22y1877Qmk9i',
      'EeFWxSM6FLrwQx2du5Ex6KfdZ8WaW3usjrMBsZ5pLxWX',
      'ApJpgs6kFaFUZkcRDZzuduSVrUat3Z5swDxkXFy7qL6f',
      'E9gppBZnUNnZrjuSjD1vdzGotXfj1JzDojhsFd8fuYHK',
      '4JNEon37EQGmgBxhKFG2ugWZXd3LNAJ6BTdEXAY7312r',
      '6WxkCEecfjB9GpDVr29nYDszPZBVzSJg8g12RDeCEwCC',
      'CdWnDF7vrAbD8WcPCfxJJoctGbepQUizwmM75xiAeBZc',
      'EgG5c4RxjuxJxWEQntQ53cpaXMiQrNbdXnRYdZ8a1a1F',
      '7yg9M5Gftczyy9ZQ5p7ugU7DeXNsiT8LGKQBEPTtPTzy',
      'Ep2f5jaFSdQoLJ4oDTDyXYf52S9AUyDkTAptMBSqdsX4',
      '5Q6j3KPRWYzkb9RehaQv8qkhtJeQt7fRgahSNGsVJ66Z',
      'GVtZ8Aosj48Zmr5Dfnk7NMTwqMEP7uvNajwhRmoP8o6G',
      '2D7zE2V3mieptB6TxJ7ZsWefvShCLQrKkzLefNZrPmAA',
      'CwM3y8YTtKwDah5HzKy51hoNdS517F1AzxsCjLbhWdQ6',
      '3pfW1zf3Z253PHJJy3aaXtM4NUV8FDjV8BE7rrNvJ4ig',
      '7KcBNu5AT9wGUKHrnq1U4CkHPampS6AKcjMSTvc1mozZ',
      'UuTw17RMkTUdoBYFS6YidEx7yW7rTc7TFPnHDXSYLuP',
      'BfDjW475YVE7EtaFRZZynkZdv5puaaLH6fRbcFmKcL97',
      'CvHBp3G4QGY59f37G9CRxSzz91hnw1pif9V76796vpzB',
      '6jJv1oh1tksohM8XpsBvSzjFZpPSDQdPduAq2yTMJ8in',
      '6nDpwB5xz6AUyuSfEHa3kcGWWJG31SqMxavY3ZK6yeeF',
      'ywkEemWHjYBPydsTpksLjLBiKrYkMqwYfahsviFfmUk',
      'BemW7s1gH7BctDEUBNyFqMNTu3b5dFfxYd9FtcJ5YFWk',
      'HSL5tqr3JBSwxrDLz29amHfUUX6odH8R8Xah7bLwoQZ4',
      'CHWak12jitocvHeWQAdczLvjxVU8bpHNzQNvoj4tonWo',
      'LDyKE4rpMu7yxhx7MpkehKKThAcdUeySe4DVyhXLeA6',
      '69haFbP4YRmPuAejpHvtcNVR1CuNcVYSSMwAhcXWP9tb',
      '83hUcNuxq7m1KDPAvXYWhYPStbrpEr8dyLRUz5QGupqA',
      '3e67rLyi9bLzRPZZEhm1S2gnXSzMt9qtFT1krWAVGNpo',
      '2SR98d2yPPxUdqw3J5oMhFJsWGn8ypVMt79umYWS6Mie',
      '6r8pxTYmSrBxLc1Akcf5VrfNRru6dtku25sKtNcmbhEX',
      '5J7AJEtoPEXuJPgsmJd81QXzXeBL2h6mKgD2BYGuX6Uv',
      'D75qegjnRG4cfKziBXm9ioDtivnBQTjfpxmrpiTtWSQL',
      '4ABkCE7sjBYxR7ZEq3sz6cC7hA3UmeHnWyXq3m3PtHdA',
      'Niay7pqkAMFTjF1BB8x9D9bwwYNLNfwtD6LnYX3Xr3W',
      'GbcsfCFH8uWCaZZHaywzP8ickT61kcPcRkrsRgCtpiNF',
      'HqhxERK76tgLdGoNQXD4bX6Rfusq7boLBjyiPQWTm6hc',
      'D5wgKqXrdwLH4LP4sF8FQEm9d4ZuBqFm4pr8UCqRPrH5',
      'H4anGPV6BZvgc2JHbAR1C5nGFgu2jfGhcEpPRkecSco1',
      '2Gr4fnb62rvbjRnyBTXDvpKmBvcx6PjmhBE5tYUiAdoM',
      'F6C1qFE1nM7YNGxZ4ESJcVwjx9DScPDLrdXV5QTwYaog',
      '2MPyRYdnJWMQrbvxkobpkW3fKsTA3bopvo9vhTru9JNo',
      '0xf920353c25a1cf09761c069c17ed2be32dacb10b',
      'DVnU1kyzyNZqaKpzwzXJe7iaby3PPWasjN5pD638jg7H',
      '0x807ac80eF6c72f8075ceDcfc01449117040Ef078',
      'C7DaWhMrkukFnsSy5uAQdWFYoQcw5LzqZ3F7dT8QHL32',
      'CuY8MSjNotnuW5YbD7q5TcFPTxQrDJWszAB2Gge8YrY1',
      '9pE4fe1bjGctsxn5ou46sG9SBhvKFeKTAdAa7KegHt9S',
      '6AfZk9RKyF2yppDVkYBE4F7UL7Ect6Aq5btEmdTFc6qM',
      '8QNnaaaHkGKcfU4Fe2pAyrmtprbuaMXzvQsGDrWJV89Z',
      'EkBHhrqexYqE1wm5QEZ26QBdhf78uKCVaC1bFy7DF3Ct',
      '7xuaXbmbjJbQRBCncFvpDKRbe52g1QWnX62feZtauhkF'
    ]

    const WL_DATE = Date.parse('05 Feb 2022 18:40:00 UTC');

    const LAUNCH_DATE = Date.parse('05 Feb 2022 19:00:00 UTC');

    const dateInPast = (firstDate: Number) => {
      let today = new Date();
  
      if (firstDate <= today.getTime()) {
        return true;
      }
  
      return false;
    };

    const checkInWL = (addy: string | undefined) => {
      if (addy !== undefined) {
        console.log(addy);
        return WL.includes(addy);
      }
      return false;
    };

    const whitelisted = checkInWL(anchorWallet?.publicKey?.toBase58());
    console.log("whitelisted " + whitelisted);

    const whiteListStarted = dateInPast(WL_DATE);
    console.log("whitelisted sale started " + whiteListStarted);

    const publicStarted = dateInPast(LAUNCH_DATE);
    console.log("public sale started " + publicStarted)

    const canMint = (whitelisted && whiteListStarted) || publicStarted;

    if (canMint) {
      setIsDisabled(false);
    }
  }, [
    anchorWallet,
    props.candyMachineId,
    props.connection,
    refreshCandyMachineState,
  ]);

  const StyledImage = styled.img`
    display: block;
    width:300px;
    height:300px;
    text-align: center;
    margin-left: auto;
    margin-right: auto;
  `;

  return (
    <Container style={{ marginTop: 100 }}>
      <Container maxWidth="xs" style={{ position: 'relative' }}>
        <Paper
          style={{ padding: 24, backgroundColor: '#151A1F', borderRadius: 6 }}
        >
          <StyledImage src={Display}/>
          <h3>Shinobi Sers Mint Launch</h3>
          <h4>Presale: 5th Feb 1840 UTC</h4>
          <h4>Public sale: 5th Feb 1900 UTC</h4>
          {!wallet.connected ? (
            <ConnectButton>Connect Wallet</ConnectButton>
          ) : (
            <>
              <Header candyMachine={candyMachine} />
              <MintContainer>
                {candyMachine?.state.isActive &&
                candyMachine?.state.gatekeeper &&
                wallet.publicKey &&
                wallet.signTransaction ? (
                  <GatewayProvider
                    wallet={{
                      publicKey:
                        wallet.publicKey ||
                        new PublicKey(CANDY_MACHINE_PROGRAM),
                      //@ts-ignore
                      signTransaction: wallet.signTransaction,
                    }}
                    gatekeeperNetwork={
                      candyMachine?.state?.gatekeeper?.gatekeeperNetwork
                    }
                    clusterUrl={rpcUrl}
                    options={{ autoShowModal: false }}
                  >
                    <MintButton
                      candyMachine={candyMachine}
                      isMinting={isUserMinting}
                      isDisabled={isDisabled}
                      onMint={onMint}
                    />
                    <CrossMintButton
                      collectionTitle="Shinobi Sers"
                      collectionDescription="444 ninjas making alpha accessible"
                      theme="dark"
                    />
                  </GatewayProvider>
                ) : (
                  <div>
                    <MintButton
                      candyMachine={candyMachine}
                      isMinting={isUserMinting}
                      isDisabled={isDisabled}
                      onMint={onMint}
                    />
                    <CrossMintButton
                      collectionTitle="Shinobi Sers"
                      collectionDescription="444 ninjas making alpha accessible"
                      theme="dark"
                      disabled={isDisabled}
                    />
                  </div>
                )}
              </MintContainer>
            </>
          )}
        </Paper>
      </Container>

      <Snackbar
        open={alertState.open}
        autoHideDuration={6000}
        onClose={() => setAlertState({ ...alertState, open: false })}
      >
        <Alert
          onClose={() => setAlertState({ ...alertState, open: false })}
          severity={alertState.severity}
        >
          {alertState.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Home;

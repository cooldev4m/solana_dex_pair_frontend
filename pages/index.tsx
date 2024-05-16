import { useEffect, useState, useMemo, useCallback, Key } from "react";
import { initNotification } from "@/utils/notification";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Selection,
  Spinner,
} from "@nextui-org/react";
import { IToken, Address, IRowType, IPair } from "@/types";
import { Pair } from '@/utils/pair';
import axios from 'axios';
axios.defaults.baseURL = 'http://192.168.147.90:3001';




let tokenInfos: Map<Address, IToken> = new Map<Address, IToken>();
let pairInfos: Map<Address, Pair> = new Map<Address, Pair>();

export default function Home() {
  useEffect(() => {
    //initSocket();
    initNotification();

    // Re-render every second
    const renderInterval = setInterval(() => {
      setSeconds(prevSeconds => prevSeconds + 1);
    }, 1000);

    const grabInterval = setInterval(getPairInfo.bind(this, 1), 1000 * 3);

    const poolCountInterval = setInterval(getPoolCount.bind(this), 1000 * 5);

    return () => {
      clearInterval(renderInterval);
      clearInterval(grabInterval);
      clearInterval(poolCountInterval);
    };
  }, []);

  const getPairInfo = (page: number): void => {
    setLoading(true);
    axios.post('/get_pairs', {
      page: page
    }).then(response => {
      if (response.status === 200 && response.data.pairs.length > 0) {
        let pairs: IPair[] = response.data.pairs;
        let tokens: {
          [address: Address]: IToken
        } = response.data.tokens;

        pairInfos.clear();
        for (let pair of pairs) {
          console.log(tokens[pair.quoteToken]);
          pairInfos.set(pair.address, new Pair(pair, tokens[pair.baseToken], tokens[pair.quoteToken]));
        }

        tokenInfos.clear();
        Object.keys(tokens).forEach(tokenAddress => tokenInfos.set(tokenAddress, tokens[tokenAddress]));

        setLoading(false);

      }
    })
  }
  const getPoolCount = (): void => {
    axios.get('/get_pair_count')
      .then(response => {
        if (response.status === 200 && response.data.count) {
          setPoolCount(count => parseInt(response.data.count));
        }
      })
  }

  const columns = [
    {
      key: "token",
      label: "TOKEN",
      width: "30%",
    },
    {
      key: "price",
      label: "PRICE",
      width: "10%",
    },
    {
      key: "age",
      label: "AGE",
      width: "10%",
    },
    {
      key: "buys",
      label: "BUYS",
      width: "10%",
    },
    {
      key: "sells",
      label: "SELLS",
      width: "10%",
    },
    {
      key: "volume",
      label: "VOLUME",
      width: "10%",
    },
    {
      key: "liquidity",
      label: "LIQUIDITY",
      width: "10%",
    },
    {
      key: "mcap",
      label: "MCAP",
      width: "10%",
    },
  ];

  const [seconds, setSeconds] = useState<number>(0);

  const rows: IRowType[] = useMemo(() => {
    let ret = [];
    pairInfos.forEach(value => ret.push(value.row()));
    return ret;
  }, [seconds]);
  const [status, setStatus] = useState(0);

  const [loading, setLoading] = useState<boolean>(false);
  const loadingState: "loading" | "idle" = useMemo(() => loading ? "loading" : "idle", [loading]);
  // Pagination functionaliy
  const [poolCount, setPoolCount] = useState<number>(0);
  const [page, setPage] = useState(1);
  const rowsPerPage: number = 15;
  const pages: number = useMemo(() => Math.ceil(poolCount / rowsPerPage), [poolCount]);
  const items: IRowType[] = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [page, rows]);


  const renderCell = useCallback((row: IRowType, columnKey: Key) => {
    const cellValue = row[columnKey as keyof IRowType];
    switch (columnKey) {
      case "token":
        return <>
          {row.token}
        </>

      case "price": {
        let ret: string | string[] = Pair.showMoney(row.price);
        // console.log(ret);
        if (typeof ret === 'object') {
          return <>
            {ret[0]}<sub>{ret[1]}</sub>{ret[2]}
          </>
        }
        return <>
          {ret}
        </>
      }

      case "age":
        return <>{row.age}</>

      case "buys":
      case "sells":
        return <>{cellValue}</>

      case "volume":
        return <>{Pair.showMoney(row.volume)}</>

      case "liquidity":
        return <>{Pair.showMoney(row.liquidity)}</>

      case "mcap":
        return <>{Pair.showMoney(row.mcap)}</>
    }
  }, []);

  const onSelectionChange = (key: Selection) => {
    if (key !== 'all') {
      let value = [...key];
      if (value[0] as string === undefined) return;
      let pairInfo = pairInfos.get(value[0] as string);
      console.log(pairInfo);
      console.log(tokenInfos.get(pairInfo.baseToken));
      console.log(tokenInfos.get(pairInfo.quoteToken));
    }
  }

  console.log(loadingState);

  return (
    <>
      <div className="w-full p-5">
        <div className="w-full p-5 flex flex-row-reverse align-middle">
          <span className="relative flex h-3 w-3">
            <span
              className={
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 " +
                (status === WebSocket.OPEN ? "bg-green-400" : "bg-red-400")
              }
            ></span>
            <span
              className={
                "relative inline-flex rounded-full h-3 w-3 " +
                (status === WebSocket.OPEN ? "bg-green-400" : "bg-red-400")
              }
            ></span>
          </span>
        </div>
        <div className="w-full top-5">
          <Table
            className="w-full block"
            aria-label="Example static collection table"
            selectionMode="single"
            color="primary"
            onSelectionChange={onSelectionChange}
            bottomContent={
              pages > 0 ? (
                <div className="flex w-full justify-center">
                  <Pagination
                    showControls
                    showShadow
                    color="secondary"
                    page={page}
                    total={pages}
                    onChange={setPage}
                  />
                </div>
              ) : null
            }
          >
            <TableHeader columns={columns}>
              {(column) => (
                <TableColumn
                  style={{ width: column.width ?? "inherit" }}
                  key={column.key}
                >
                  {column.label}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody items={items} loadingContent={<Spinner />} loadingState={loadingState}>
              {(item) => (
                <TableRow key={item.key} className="cursor-pointer">
                  {(columnKey) => (
                    <TableCell>{renderCell(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

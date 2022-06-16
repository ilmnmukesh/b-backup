import adminBro, { ApiClient } from "adminjs";
import {
    Box,
    Label,
    H1,
    Button,
    Input,
    Header,
    Modal,
    Loader,
    Text,
} from "@adminjs/design-system";
import { useState, useEffect } from "react";
import CountDown from "react-countdown";

const modalProps = {
    title: "QR Expires",
    variant: "danger",
    subTitle: "This Product QR has been Expires reload the page",
    buttons: [
        {
            label: "Ok",
            variant: "danger",
            onClick: () => window.location.reload(),
        },
    ],
};

const InputComp = ({ setData, setLoading, setTime }) => {
    const [searchVal, setSearchVal] = useState("");
    const SIZE = 4;
    const setSearch = (e) => {
        let val = e.target.value.split("-").join("");
        if (val.length > SIZE * 4) return;
        let data = val.slice(0, SIZE);
        for (let i = 1; i < val.length / SIZE; i++) {
            data += "-" + val.slice(i * SIZE, (i + 1) * SIZE);
        }
        setSearchVal(data);
    };
    const fun = async () => {
        if (searchVal.length <= 0) return;
        setLoading(true);
        const api = new ApiClient();
        api.getPage({
            pageName: "verify",
            url: "/api/admin/wallet/search?q=" + searchVal.split("-").join(""),
            baseURL: adminBro.env.HOST,
            method: "get",
        })
            .then((res) => {
                if (res.data.success) {
                    setData(res.data.data);
                    setTime(
                        res.data?.data?.expiresIn
                            ? res.data?.data?.expiresIn
                            : 0,
                    );
                } else {
                    alert("Unable to fecth data");
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };
    return (
        <Box
            className='col-6 m-0 p-0 pt-3'
            variant='white'
            style={{ textAlign: "center", width: "100%" }}>
            <Label style={{ fontSize: 20 }} htmlFor='searchCode'>
                Search Code
            </Label>
            <Input
                value={searchVal}
                style={{ textTransform: "uppercase" }}
                onKeyDown={(e) => {
                    if (e.key === "Enter") fun();
                }}
                onChange={setSearch}
                placeholder='XXXX-XXXX-XXXX-XXXX'
                id='searchCode'
                width={1 / 2}
            />
            <Button onClick={fun}>Search</Button>
        </Box>
    );
};
const TimeComp = ({ time, setTime }) => {
    const TimeRender = ({ seconds, completed }) => {
        if (completed) {
            return <h5>This QR has been expired</h5>;
        } else {
            return <h3 className='mt-0 pt-0'>{seconds}s</h3>;
        }
    };
    useEffect(() => {
        let query = new URL(window.location.href).searchParams;
        let t = query.get("t");
        setTime((_) => parseInt(t));
    }, []);
    return (
        <Box className='col-6' variant='white'>
            <div className='row'>
                {/*data.data ? "Expiry within" : */}
                <h3 className=' text-center col-6 m-0 p-0'>{"Expires"}</h3>
                {time != 0 ? (
                    <CountDown
                        className='col-6 m-0 p-0'
                        date={new Date(parseInt(time) * 1000)}
                        renderer={TimeRender}
                    />
                ) : (
                    <></>
                )}
            </div>
        </Box>
    );
};
const MainComp = ({ data, setData, loading, setLoading, setTime }) => {
    const [btnLoader, setBtnLoader] = useState(false);
    const updateStatus = async (ch, code) => {
        setBtnLoader(true);
        let api = new ApiClient();
        api.getPage({
            pageName: "verify",
            url: "/api/admin/update/history/",
            data: { status: code, ch },
            baseURL: adminBro.env.HOST,
            method: "POST",
        }).then((res) => {
            if (res.data.success) {
                setData((e) => {
                    let f = e;
                    f.approve = false;
                    f.status = res.data.data.status;
                    setBtnLoader(false);
                    return f;
                });
            } else {
                alert("Unable to fecth data");
            }
        });
    };
    useEffect(() => {
        let query = new URL(window.location.href).searchParams;
        let ch = query.get("ch");
        let api = new ApiClient();
        if (ch == undefined || ch == null) return;
        console.log(adminBro.env.HOST);
        api.getPage({
            pageName: "verify",
            url: "/api/admin/verify/" + ch,
            baseURL: adminBro.env.HOST,
            method: "get",
        }).then((res) => {
            if (res.data.success) {
                setData(res.data.data);
                setTime(
                    res.data?.data?.expiresIn ? res.data?.data?.expiresIn : 0,
                );
            } else {
                alert("Unable to fecth data");
            }
            setLoading(false);
        });
    }, []);
    return (
        <>
            {loading ? (
                <Loader />
            ) : (
                <Box variant='white' className={"row"}>
                    <Box className='col-6 text-center '>
                        <div className='mt-2'>
                            <img src={data?.cloud_wallet?.product?.image}></img>
                            <div>
                                <H1>{data?.cloud_wallet?.product?.name}</H1>
                            </div>
                        </div>
                    </Box>
                    <Box className='col-6 '>
                        <div>
                            <div className='form-inline mt-4'>
                                <h4 style={{ color: "grey" }}>Size:</h4>
                                <h3>
                                    {data?.cloud_wallet?.varient?.volume} ml
                                </h3>
                            </div>
                            <div className='form-inline mt-2'>
                                <h4 style={{ color: "grey" }}>Shots:</h4>
                                <h3>{data?.noOfShots} </h3>
                            </div>
                            <div className='form-inline mt-2'>
                                <h4 style={{ color: "grey" }}>Unit Price:</h4>
                                <h3>$ {data?.cloud_wallet?.varient?.mrp}</h3>
                            </div>
                            <div className='form-inline mt-2'>
                                <h4 style={{ color: "grey" }}>Cost Price:</h4>
                                <h3>
                                    ${" "}
                                    {data?.cloud_wallet?.varient?.sellingPrice}{" "}
                                </h3>
                            </div>
                            <div className='row text-center mt-5'>
                                {btnLoader ? (
                                    <div className='col-8 m-0 p-0 text-center'>
                                        <Loader />
                                    </div>
                                ) : data?.approve ? (
                                    <div className='mx-2 col-6'>
                                        {data?.status == "expires" ||
                                        data?.status == 1 ? (
                                            <Button
                                                variant='disabled'
                                                disabled={true}>
                                                Expired
                                            </Button>
                                        ) : (
                                            <Button
                                                variant='danger'
                                                onClick={() => {
                                                    updateStatus(data?.id, 1);
                                                }}>
                                                Update Expires
                                            </Button>
                                        )}
                                    </div>
                                ) : data?.status == "redeem" ? (
                                    <>
                                        <div className='mx-2'>
                                            <Button variant='success'>
                                                Redeem
                                            </Button>
                                        </div>
                                    </>
                                ) : data?.status == "cancel" ? (
                                    <>
                                        <div className='mx-2'>
                                            <Button variant='danger'>
                                                Cancelled
                                            </Button>
                                        </div>
                                    </>
                                ) : data?.status == "expires" ? (
                                    <>
                                        <div className='mx-2'>
                                            <Button
                                                variant='disabled'
                                                disabled={true}>
                                                Expired
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className='mx-2'>
                                            <Button
                                                variant='danger'
                                                onClick={() => {
                                                    updateStatus(data?.id, 3);
                                                }}>
                                                Cancel
                                            </Button>
                                        </div>
                                        <div>
                                            <Button
                                                variant='success'
                                                onClick={() => {
                                                    updateStatus(data?.id, 2);
                                                }}>
                                                Confirm
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </Box>
                </Box>
            )}
        </>
    );
};

const App = () => {
    const [isVisible, setVisible] = useState(false);
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [time, setTime] = useState(0);
    return (
        <Box py='lg' style={{ overflowX: "hidden" }}>
            <link
                rel='stylesheet'
                href='https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css'
                integrity='sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO'
                crossOrigin='anonymous'
            />
            <script
                src='https://code.jquery.com/jquery-3.3.1.slim.min.js'
                integrity='sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo'
                crossOrigin='anonymous'></script>

            <script
                src='https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.0/umd/popper.min.js'
                integrity='sha384-cs/chFZiN24E4KMATLdqdvsezGxaGsi4hLGOzlXwp5UZB1LY//20VyM2taTB4QvJ'
                crossOrigin='anonymous'></script>

            <script
                src='https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js'
                integrity='sha384-uefMccjFJAIv6A+rW+L4AHf99KvxDjWSu1z9VI8SKNVmz4sk7buKt/6v9KI65qnm'
                crossOrigin='anonymous'></script>
            {isVisible && <Modal {...modalProps} />}
            <div className='row m-0 p-0 '>
                <InputComp
                    setLoading={setLoading}
                    setData={setData}
                    setTime={setTime}
                />
                <TimeComp time={time} setTime={setTime} />
            </div>
            <MainComp
                loading={loading}
                setLoading={setLoading}
                setTime={setTime}
                setData={setData}
                data={data}
            />
        </Box>
    );
};
export default App;

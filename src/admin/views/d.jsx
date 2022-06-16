// my-dashboard-component.jsx
import { ApiClient } from "adminjs";
import { Box, H1, Button, Modal, Loader } from "@admin-bro/design-system";
import { useState, useEffect } from "react";
const api = new ApiClient();
import CountDown from "react-countdown";

const Dashboard = () => {
    const [data, setData] = useState({});
    const [time, setTime] = useState(0);
    const [histId, setHistId] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [btnLoader, setBtnLoader] = useState(false);

    const TimeRender = ({ seconds, completed }) => {
        if (completed) {
            return <h3>This QR has been expired</h3>;
        } else {
            return <H1 className='mt-0 pt-0'>{seconds}</H1>;
        }
    };
    const updateStatus = async (status) => {
        if (histId == null) {
            return;
        }
        setBtnLoader(true);
        let datas = await api.getPage({
            pageName: "verify",
            data: {
                opt: 1,
                status: status,
                chId: histId,
            },
            method: "POST",
        });
        datas = datas.data;
        setData((e) => {
            if (datas.success) {
                e.details.status = datas.details.status;
            }
            return e;
        });
        setBtnLoader(false);
        console.log(datas);
    };

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
    useEffect(() => {
        let query = new URL(window.location.href).searchParams;
        let cw = query.get("cw");
        let t = query.get("t");
        let sc = query.get("sc");
        let s = query.get("s");
        setTime((_) => parseInt(t));
        setHistId(cw);
        api.getPage({
            pageName: "verify",
            data: {
                cloudHistory: cw,
                token: sc,
                secret: s,
                time: t,
            },
            method: "post",
        })
            .then((d) => {
                console.log(d.data);
                setData(d.data);
            })
            .catch(console.log);
    }, []);

    if (
        data === undefined ||
        Object.values(data).length == 0 ||
        (!data?.data && data.details == null)
    ) {
        return (
            <Box style={{ textAlign: "center", marginTop: 70 }}>
                <H1 style={{ alignItem: "center" }}>Invalid Creditionals</H1>
            </Box>
        );
    }
    return (
        <Box variant='grey'>
            {isVisible && <Modal {...modalProps} />}
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
            <Box variant='white'>
                <div className='row'>
                    <h1 className=' text-center col-6 m-0 p-0'>
                        {data.data ? "Expiry within" : "Expires"}
                    </h1>
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
            <Box variant='white' className={"row"}>
                <Box className='col-6 text-center '>
                    <div className='mt-2'>
                        <img
                            src={
                                data?.details?.cloud_wallet?.product?.image
                            }></img>
                        <div>
                            <H1>
                                {data?.details?.cloud_wallet?.product?.name}
                            </H1>
                        </div>
                    </div>
                </Box>
                <Box className='col-6 '>
                    <div>
                        <div className='form-inline mt-4'>
                            <h4 style={{ color: "grey" }}>Size:</h4>
                            <h3>
                                {data?.details?.cloud_wallet?.varient?.volume}{" "}
                                ml
                            </h3>
                        </div>
                        <div className='form-inline mt-2'>
                            <h4 style={{ color: "grey" }}>Shots:</h4>
                            <h3>{data?.details?.noOfShots} </h3>
                        </div>
                        <div className='form-inline mt-2'>
                            <h4 style={{ color: "grey" }}>Unit Price:</h4>
                            <h3>
                                $ {data?.details?.cloud_wallet?.varient?.mrp}
                            </h3>
                        </div>
                        <div className='form-inline mt-2'>
                            <h4 style={{ color: "grey" }}>Cost Price:</h4>
                            <h3>
                                ${" "}
                                {
                                    data?.details?.cloud_wallet?.varient
                                        ?.sellingPrice
                                }{" "}
                            </h3>
                        </div>
                        <div className='row text-center mt-5'>
                            {btnLoader ? (
                                <div className='col-8 m-0 p-0 text-center'>
                                    <Loader />
                                </div>
                            ) : !data.data ? (
                                <div className='mx-2 col-6'>
                                    {data?.details?.status == "expires" ||
                                    data?.details?.status == 1 ? (
                                        <Button
                                            variant='disabled'
                                            disabled={true}>
                                            Expired
                                        </Button>
                                    ) : (
                                        <Button
                                            variant='danger'
                                            onClick={() => {
                                                updateStatus(1);
                                            }}>
                                            Update Expires
                                        </Button>
                                    )}
                                </div>
                            ) : data?.details?.status == "redeem" ? (
                                <>
                                    <div className='mx-2'>
                                        <Button variant='success'>
                                            Redeem
                                        </Button>
                                    </div>
                                </>
                            ) : data?.details?.status == "cancel" ? (
                                <>
                                    <div className='mx-2'>
                                        <Button variant='danger'>
                                            Cancelled
                                        </Button>
                                    </div>
                                </>
                            ) : data?.details?.status == "expires" ? (
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
                                                updateStatus(3);
                                            }}>
                                            Cancel
                                        </Button>
                                    </div>
                                    <div>
                                        <Button
                                            variant='success'
                                            onClick={() => {
                                                updateStatus(2);
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
        </Box>
    );
};

export default Dashboard;

# live mx verification batch, 2026-10-08

method: mx records resolved over dns-over-https (cloudflare public
resolver, application/dns-json) for each provider domain, 2026-10-08.
dns observation of public records; no license, no terms; recheck on every
table refresh. raw log: research/sources/live-mx-2026-10-08.txt

findings used by the provider table:
- migadu.com -> mx.migadu.com (customer pattern aspmx1..3.migadu.com per
  migadu's guides; the suffix match covers both)
- purelymail.com -> mailserver.purelymail.com
- mxroute.com -> arrow.mxrouting.net, arrow-relay.mxrouting.net
  (customers get per-account subdomains)
- ionos.de, 1und1.de, 1und1.com, ionos.com, schlund.de, kundenserver.de,
  perfora.net -> mxint01/mxint02.1and1.com (the whole brand family
  converged; legacy kundenserver.de/perfora.net customer hostnames kept
  as entries)
- ovh.com -> mx1/mx2.ovh.net; gandi.net -> mail8/mail12.gandi.net
  (both sell mailboxes and free forwarding; classified shared, not guessed)
- one.com -> mx1..4.pub.mailpod12-cph3.one.com
- hostinger.com itself runs google workspace; its product hosts
  mx1/mx2.hostinger.com are docs-verified only
  (hostinger.com/support/4407237-hostinger-email-mx-records)
- consumer isps: btinternet.com -> mx.bt.prod.cloud.openwave.ai;
  virginmedia.com -> atmailcloud (eu-west); iinet.net.au and
  optusnet.com.au -> atmailcloud (au-east); sky.com -> yahoodns.net
  (already covered); talktalk.net -> *.tt.xion.oxcs.net; laposte.net ->
  smtpz4.laposte.net; orange.fr -> smtp-in/smtp-in2.orange.fr; sfr.fr ->
  smtp-in.sfr.fr; free.fr -> mx1/mx2.free.fr; web.de -> mx-ha02/03.web.de;
  t-online.de -> mx00..03.t-online.de; freenet.de -> mx.freenet.de;
  libero.it -> smtp-in.libero.it; virgilio.it -> smtp-in.virgilio.it;
  tiscali.it -> etb/imp.mail.tiscali.it; ziggo.nl -> mxin5/10.ziggo.nl;
  kpnmail.nl -> mx.kpnmail.nl (kpn.nl itself has no mx; consumer mail is
  at kpnmail.nl); telenet.be -> mx1/2.telenet-ops.be; bigpond.com ->
  extmail.bigpond.com; xtra.co.nz -> mx.xm.smxcloud.com; eircom.net ->
  eir-XX.mx.a.cloudfilter.net; telia.com -> mail.telia.com; stofa.dk ->
  mx10/20.norlys.dk; yousee.dk -> mxa/mxb-00360101.gslb.pphosted.com
  (proofpoint gateway: yousee reports as gateway, which is the honest
  routing answer for a consumer mail service behind a security gateway)

#include <EEPROM.h>
#include <Servo.h>
#include <DS3231.h>
#include <SoftwareSerial.h>

#define DEBUG true
#define SET_RTC false
#define SHOW_TIME false

const byte LOCK_SERVO_PIN = A3;
const byte LOCK_FEEDBACK_PIN = A4; // future use
const byte LOCK_OPEN = 100;
const byte LOCK_LOCKED = 40;
const byte OAT_ADDRESS = 0;  //address to store the open at time

enum LockPosition {
	unknown,
	open,
	locked
};

long openAtTime;
LockPosition lockPosition;

SoftwareSerial bluetoothSerial(3, 4); //RX, TX
DS3231 rtc(SDA, SCL);
Servo lockServo;

void setup()
{
	if (DEBUG)	Serial.begin(9600);

	bluetoothSerial.begin(9600);
	while (!bluetoothSerial)
	{
		delay(50);
	}

	rtc.begin();

	if (SET_RTC)
	{
		rtc.setDate(10, 4, 2016);
		rtc.setTime(17, 38, 0);
	}

	if (SET_RTC || SHOW_TIME)
	{
		while (1)
		{
			printTimeString();
			delay(1000);
		}
	}

	openAtTime = EEPROMReadlong(OAT_ADDRESS);

	lockPosition = unknown;

	delay(100);

	if (DEBUG) printDebugInfo();
	if (DEBUG) Serial.println("Initialized");
}

void loop()
{
	if (openAtTime <= getRtcTime()) // should be open
	{
		if (lockPosition == locked || lockPosition == unknown)
		{
			lockControl("open");
		}
	}
	else // should be locked
	{
		if (lockPosition == open || lockPosition == unknown)
		{
			lockControl("lock");
		}
	}

	if (bluetoothSerial.available())
	{
		String request = bluetoothSerial.readString();

		if (DEBUG)
		{
			Serial.println(request);
		}

		if (request == "getrtc")
		{
			bluetoothSerial.println(
				formatJsonString("rtc", (String)rtc.getUnixTime(rtc.getTime()))
				);
		}
		else if (request == "getoat")
		{
			bluetoothSerial.println(
				formatJsonString("oat", (String)openAtTime)
				);
		}
		else if (request.startsWith("setrtc"))
		{
			setRtc(request.substring(request.indexOf(':') + 1));
			Serial.println(getTimeString());
		}
		else if (request.startsWith("setoat"))
		{
			// TODO: don't allow OAT to be
			// set if box is in a locked state
			setOpenAtTime(request.substring(request.indexOf(':') + 1));
			if (DEBUG) printDebugInfo();
		}
	}
}

void setOpenAtTime(String oat)
{
	openAtTime = oat.toFloat();

	EEPROMWritelong(OAT_ADDRESS, openAtTime);
}

String formatJsonString(String key, String value)
{
	return "{\"key\":\"" + key + "\",\"value\":\"" + value + "\"}";
}

void lockControl(String position)
{
	if (position == "lock")
	{
		lockServo.write(LOCK_LOCKED);
		lockPosition = locked;
	}
	else if (position == "open")
	{
		lockServo.write(LOCK_OPEN);
		lockPosition = open;
	}

	lockServo.attach(LOCK_SERVO_PIN);
	delay(1000);
	lockServo.detach();
}

long getRtcTime()
{
	return rtc.getUnixTime(rtc.getTime());
}

void setRtc(String rtcTime)
{
	char rtcBuffer[19];
	char * rtcParts;

	rtcTime.toCharArray(rtcBuffer, rtcTime.length());

	uint8_t day = (uint8_t)atol(strtok(rtcBuffer, "|"));
	uint8_t mon = (uint8_t)atol(strtok(NULL, "|"));
	uint16_t year = (uint8_t)atol(strtok(NULL, "|")) + 2000;
	uint8_t hour = (uint8_t)atol(strtok(NULL, "|"));
	uint8_t min = (uint8_t)atol(strtok(NULL, "|"));
	uint8_t sec = (uint8_t)atol(strtok(NULL, "|"));

	rtc.setDate(day, mon, year);
	rtc.setTime(hour, min, sec);
}

void printTimeString()
{
	Serial.print(rtc.getDateStr());
	Serial.print(" ");
	Serial.print(rtc.getTimeStr());
	Serial.println(" GMT");
}

String getTimeString()
{
	String time;

	time += rtc.getDateStr();
	time += " ";
	time += rtc.getTimeStr();

	return time;
}

void printDebugInfo()
{
	Serial.println("---------------------");
	Serial.print("rtc time:\t");
	printTimeString();
	Serial.print("rtc unix time:\t");
	Serial.println(getRtcTime());
	Serial.print("oat:\t\t");
	Serial.println(openAtTime);
	Serial.print("second remain:\t");
	Serial.println(openAtTime - getRtcTime() > 0 ? openAtTime - getRtcTime() : 0);
	Serial.print("lock position:\t");
	Serial.println(lockPosition == locked ? "locked" : "open");
	Serial.println("---------------------");
}

// ATTRIBUTION:
// Created by Kevin Elsenberger 
// June 2, 2013
// elsenberger.k at gmail.com 
// http://playground.arduino.cc/Code/EEPROMReadWriteLong
long EEPROMReadlong(long address)
{
	long four = EEPROM.read(address);
	long three = EEPROM.read(address + 1);
	long two = EEPROM.read(address + 2);
	long one = EEPROM.read(address + 3);

	return ((four << 0) & 0xFF) + 
		((three << 8) & 0xFFFF) + 
		((two << 16) & 0xFFFFFF) + 
		((one << 24) & 0xFFFFFFFF);
}

// ATTRIBUTION:
// Created by Kevin Elsenberger 
// June 2, 2013
// elsenberger.k at gmail.com 
// http://playground.arduino.cc/Code/EEPROMReadWriteLong
void EEPROMWritelong(int address, long value)
{
	byte four = (value & 0xFF);
	byte three = ((value >> 8) & 0xFF);
	byte two = ((value >> 16) & 0xFF);
	byte one = ((value >> 24) & 0xFF);

	EEPROM.write(address, four);
	EEPROM.write(address + 1, three);
	EEPROM.write(address + 2, two);
	EEPROM.write(address + 3, one);
}
